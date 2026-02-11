/**
 * Sync Service - Background sync for pending workouts and calendar data
 * Handles uploading local workouts to the backend when online
 */

import { storage } from './StorageAdapter.js';
import { createWorkoutSession } from '@/services/api/workoutSessions';
import { markRestDay } from '@/services/api/dailyActivity';
import { checkNetworkStatus as checkNetwork } from '@/services/network/networkService';
import { fetchUserCustomExercises } from '@/services/api/customExercisesBackend';

/**
 * Network status check
 * @returns {Promise<boolean>}
 */
export async function checkNetworkStatus() {
  return checkNetwork();
}

/**
 * Get local date string in YYYY-MM-DD format from a timestamp
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Date string in YYYY-MM-DD format
 */
function getLocalDateFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts local workout format to new API format with flat sets array
 * @param {import('./types').WorkoutSession} workout
 * @param {string} userId
 * @param {Object} exerciseMap - Map of exercise IDs to exercise data
 * @param {Array} customExercises - Array of custom exercises from backend
 * @returns {object}
 */
function convertWorkoutToApiFormat(workout, userId, exerciseMap, customExercises) {
  // Debug: Log raw workout data
  console.log('[Sync] Converting workout:', {
    id: workout.id,
    exerciseCount: workout.exercises?.length || 0,
    exercises: workout.exercises?.map(e => ({
      exerciseId: e.exerciseId,
      exerciseName: e.exerciseName,
      setCount: e.sets?.length || 0
    }))
  });

  // Check if exercises array exists
  if (!workout.exercises || !Array.isArray(workout.exercises)) {
    console.error('[Sync] Workout has no exercises array:', workout.id);
    return {
      userId: parseInt(userId),
      splitId: null,
      dayName: 'Workout',
      weekNumber: null,
      dayNumber: null,
      notes: null,
      completedAt: undefined,
      localDate: null,
      sets: []
    };
  }

  const allSets = [];
  let exerciseOrderIndex = 0;

  // Create a lookup map for custom exercises by ID (both string ID and backendId)
  const customExerciseMap = {};
  customExercises.forEach(ce => {
    customExerciseMap[String(ce.id)] = ce;
    if (ce.backendId) customExerciseMap[String(ce.backendId)] = ce;
  });

  // Process each exercise and flatten into sets
  const validExercises = workout.exercises.filter(exercise => {
    const hasName = exercise.exerciseName || exercise.exerciseId;
    const hasSets = exercise.sets && exercise.sets.length > 0;

    if (!hasName || !hasSets) {
      console.warn('[Sync] Filtering out invalid exercise:', {
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        setCount: exercise.sets?.length || 0
      });
      return false;
    }
    return true;
  });

  validExercises.forEach(exercise => {
    const exerciseId = String(exercise.exerciseId);
    const dbExercise = exerciseMap[exerciseId];

    // Check if this is a custom exercise
    const customEx = customExerciseMap[exerciseId];
    const isCustom = !!customEx || exercise.isCustom || false;

    // Determine localExerciseId (from exerciseDatabase.js) or customExerciseId (backend ID)
    const localExerciseId = isCustom ? null : (parseInt(exerciseId) || null);
    const customExerciseId = isCustom ? (customEx?.id || parseInt(exerciseId) || null) : null;

    // Get exercise name and type
    const exerciseName = exercise.exerciseName || dbExercise?.name || customEx?.name || exerciseId;
    const exerciseType = exercise.exerciseType || dbExercise?.exerciseType || customEx?.exerciseType || null;

    // Convert each set
    exercise.sets.forEach(set => {
      allSets.push({
        setNumber: (set.setIndex ?? set.setNumber ?? 0) + 1,
        localExerciseId,
        isCustomExercise: isCustom,
        customExerciseId,
        exerciseName,
        exerciseType,
        orderIndex: exerciseOrderIndex,
        // Strength fields
        weight: set.weight ?? null,
        reps: set.reps ?? null,
        rpe: set.rpe ?? null,
        restSeconds: set.restSeconds ?? null,
        // Cardio fields
        durationMinutes: set.duration ?? set.durationMinutes ?? null,
        incline: set.incline ?? null,
        speed: set.speed ?? null,
        completed: set.completed || false
      });
    });

    exerciseOrderIndex++;
  });

  // Determine dayName: "Freestyle Workout" for freestyle, day name for splits
  const dayName = workout.source === 'freestyle'
    ? 'Freestyle Workout'
    : (workout.dayName || workout.workoutName || 'Workout');

  // Get the local date from the completedAt timestamp
  const localDate = workout.completedAt ? getLocalDateFromTimestamp(workout.completedAt) : null;

  return {
    userId: parseInt(userId),
    splitId: workout.splitId ? parseInt(workout.splitId) : null,
    dayName,
    weekNumber: workout.weekNumber ?? null,
    dayNumber: workout.dayIndex != null ? workout.dayIndex + 1 : null,
    notes: workout.notes ?? null,
    completedAt: workout.completedAt ? new Date(workout.completedAt).toISOString() : undefined,
    localDate,
    sets: allSets
  };
}

/**
 * Syncs a single workout to the backend
 * @param {string|number} userId - User ID for scoped storage
 * @param {import('./types').WorkoutSession} workout
 * @param {Object} [preloaded] - Optional preloaded data to avoid redundant fetches
 * @param {Object} [preloaded.exerciseMap] - Pre-built exercise map
 * @param {Array} [preloaded.customExercises] - Pre-fetched custom exercises
 * @returns {Promise<{success: boolean, error?: any, shouldRetry?: boolean, result?: any}>}
 */
export async function syncWorkout(userId, workout, preloaded) {
  try {
    let exerciseMap;
    let customExercises;

    if (preloaded?.exerciseMap && preloaded?.customExercises) {
      // Use preloaded data from syncPendingWorkouts batch
      exerciseMap = preloaded.exerciseMap;
      customExercises = preloaded.customExercises;
    } else {
      // Standalone call — load fresh
      const exercises = await storage.getExercises();

      console.log('[Sync] Exercise database loaded:', exercises.length, 'exercises');

      if (!exercises || exercises.length === 0) {
        console.warn('[Sync] Exercise database is empty! Cannot enrich workout with names.');
      }

      exerciseMap = {};
      exercises.forEach(ex => {
        exerciseMap[String(ex.id)] = ex;
      });

      customExercises = [];
      try {
        const isOnline = await checkNetworkStatus();
        if (isOnline) {
          customExercises = await fetchUserCustomExercises(userId);
        }
      } catch (err) {
        console.warn('[Sync] Failed to fetch custom exercises:', err.message);
      }

      // Add custom exercises to map
      customExercises.forEach(ex => {
        exerciseMap[String(ex.id)] = { ...ex, isCustom: true };
      });
    }

    // Convert to new API format with flat sets array
    const apiData = convertWorkoutToApiFormat(workout, userId, exerciseMap, customExercises);

    console.log('[Sync] API data prepared:', {
      dayName: apiData.dayName,
      setsCount: apiData.sets?.length || 0,
      sets: apiData.sets?.slice(0, 2) // Log first 2 sets for debugging
    });

    // Don't sync workouts with no valid sets
    if (!apiData.sets || apiData.sets.length === 0) {
      console.warn('[Sync] Skipping workout with no valid sets:', workout.id);
      return {
        success: false,
        error: new Error('Workout has no valid sets'),
        shouldRetry: false
      };
    }

    const result = await createWorkoutSession(apiData);

    // Store the database ID mapping
    if (result && result.id) {
      await storage.setWorkoutDatabaseId(userId, workout.id, result.id);
    }

    return { success: true, result };
  } catch (error) {
    // Check if it's a server error (5xx) - don't retry these
    const statusCode = error.response?.status;
    const shouldRetry = !statusCode || statusCode < 500 || statusCode >= 600;

    console.error('[Sync] Failed to sync workout:', {
      workoutId: workout.id,
      statusCode,
      message: error.response?.data?.error || error.message,
      shouldRetry
    });

    return { success: false, error, shouldRetry };
  }
}

/**
 * Syncs all pending workouts to the backend
 * @param {string} userId
 * @returns {Promise<{synced: number, failed: number, errors: any[]}>}
 */
export async function syncPendingWorkouts(userId) {
  console.log('[Sync] syncPendingWorkouts called with userId:', userId, 'type:', typeof userId);

  if (!userId) {
    console.log('[Sync] Early return: no userId');
    return { synced: 0, failed: 0, errors: [] };
  }

  // Normalize userId to string for consistent storage key generation
  const normalizedUserId = String(userId);

  // Check network status first
  const isOnline = await checkNetworkStatus();
  console.log('[Sync] Network status:', isOnline);
  if (!isOnline) {
    console.log('[Sync] Early return: offline');
    return { synced: 0, failed: 0, errors: [] };
  }

  const pendingWorkouts = await storage.getPendingWorkouts(normalizedUserId);
  console.log('[Sync] Pending workouts count:', pendingWorkouts.length);

  if (pendingWorkouts.length === 0) {
    console.log('[Sync] Early return: no pending workouts');
    return { synced: 0, failed: 0, errors: [] };
  }

  let synced = 0;
  let failed = 0;
  const errors = [];

  // Preload exercise DB and custom exercises once for the entire batch
  let preloaded = null;
  const workoutItems = pendingWorkouts.filter(w => w.type !== 'rest_day' && !w.id?.startsWith('rest-'));
  if (workoutItems.length > 0) {
    try {
      const exercises = await storage.getExercises();
      const exerciseMap = {};
      exercises.forEach(ex => {
        exerciseMap[String(ex.id)] = ex;
      });

      let customExercises = [];
      try {
        customExercises = await fetchUserCustomExercises(normalizedUserId);
      } catch (err) {
        console.warn('[Sync] Failed to fetch custom exercises for batch:', err.message);
      }

      // Add custom exercises to map
      customExercises.forEach(ex => {
        exerciseMap[String(ex.id)] = { ...ex, isCustom: true };
      });

      preloaded = { exerciseMap, customExercises };
    } catch (err) {
      console.warn('[Sync] Failed to preload exercise data, will load per-workout:', err.message);
    }
  }

  console.log('[Sync] Starting to process', pendingWorkouts.length, 'pending workouts');

  for (const workout of pendingWorkouts) {
    // Sync rest days to DailyActivity table
    if (workout.type === 'rest_day' || workout.id?.startsWith('rest-')) {
      try {
        const restDate = workout.date
          ? getLocalDateFromTimestamp(new Date(workout.date).getTime())
          : getLocalDateFromTimestamp(Date.now());

        await markRestDay(normalizedUserId, restDate, {
          activityType: workout.activityType || 'planned_rest',
          isPlanned: workout.isPlanned ?? true,
          restReason: workout.restReason || workout.caption || null,
          recoveryActivities: workout.recoveryActivities || workout.activities || [],
          splitId: workout.splitId || null,
          weekNumber: workout.weekNumber || null,
          dayNumber: workout.dayNumber || null,
        });

        console.log('[Sync] Rest day synced successfully:', workout.id);
        await storage.markWorkoutSynced(normalizedUserId, workout.id);
        synced++;
      } catch (err) {
        console.error('[Sync] Failed to sync rest day:', workout.id, err.message);
        failed++;
        errors.push({ workoutId: workout.id, error: err });
      }
      continue;
    }

    console.log('[Sync] Syncing workout:', workout.id);
    const result = await syncWorkout(normalizedUserId, workout, preloaded);

    if (result.success) {
      console.log('[Sync] Workout synced successfully:', workout.id);
      // Mark as synced and remove from pending queue
      await storage.markWorkoutSynced(normalizedUserId, workout.id);
      synced++;
    } else {
      // If this is a server error (5xx) that shouldn't be retried,
      // mark it as synced to prevent infinite retry loop
      if (result.shouldRetry === false) {
        console.warn('[Sync] Marking workout as synced to prevent infinite retry:', workout.id);
        await storage.markWorkoutSynced(normalizedUserId, workout.id);
      }

      failed++;
      errors.push({
        workoutId: workout.id,
        error: result.error,
        statusCode: result.error?.response?.status
      });
    }
  }

  return { synced, failed, errors };
}

/**
 * Attempts to sync in the background (non-blocking)
 * Syncs pending workouts to the backend
 * Note: Custom exercises are now backend-only (no local sync)
 * Note: Calendar is now backend-only (no local sync)
 * @param {string} userId
 * @returns {Promise<void>}
 */
export async function backgroundSync(userId) {
  try {
    // Sync pending workouts
    await syncPendingWorkouts(userId);
  } catch (error) {
    // Don't throw - background sync should fail silently
    console.error('[Sync] Background sync error:', error);
  }
}

/**
 * Gets sync status info
 * @param {string|number} userId - User ID for scoped storage
 * @returns {Promise<{pendingCount: number, hasInternet: boolean}>}
 */
export async function getSyncStatus(userId) {
  try {
    const pending = userId ? await storage.getPendingWorkouts(userId) : [];
    const isOnline = await checkNetworkStatus();

    return {
      pendingCount: pending.length,
      hasInternet: isOnline
    };
  } catch (error) {
    return {
      pendingCount: 0,
      hasInternet: false
    };
  }
}
