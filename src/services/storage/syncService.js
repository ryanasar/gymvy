/**
 * Sync Service - Background sync for pending workouts and calendar data
 * Handles uploading local workouts to the backend when online
 */

import { storage } from './StorageAdapter.js';
import { createWorkoutSession } from '@/services/api/workoutSessions';
import { checkNetworkStatus as checkNetwork } from '@/services/network/networkService';
import { createCustomExerciseOnBackend } from '@/services/api/customExercisesBackend';
import { syncCalendarWithBackend } from './calendarStorage.js';

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
 * Converts local workout format to API format
 * @param {import('./types').WorkoutSession} workout
 * @param {string} userId
 * @returns {object}
 */
function convertWorkoutToApiFormat(workout, userId) {
  // Filter out exercises that don't have a name or have no sets
  const validExercises = workout.exercises
    .filter(exercise => {
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
    })
    .map((exercise) => ({
      name: exercise.exerciseName || exercise.exerciseId,
      templateId: null,
      notes: null,
      exerciseType: exercise.exerciseType || null, // "strength" | "cardio"
      sets: exercise.sets.map(set => ({
        setNumber: set.setIndex + 1,
        // Strength fields
        weight: set.weight || null,
        reps: set.reps || null,
        // Cardio fields
        duration: set.duration || null,
        incline: set.incline || null,
        speed: set.speed || null,
        completed: set.completed
      }))
    }));

  // Get the local date from the completedAt timestamp
  // This ensures the backend creates the DailyActivity on the correct date in user's timezone
  const localDate = workout.completedAt ? getLocalDateFromTimestamp(workout.completedAt) : null;

  return {
    userId: userId,
    splitId: workout.splitId || null,
    dayName: workout.dayName || workout.workoutName || 'Workout',
    weekNumber: null,
    dayNumber: workout.dayIndex + 1,
    notes: null,
    completedAt: workout.completedAt,
    localDate: localDate, // Pass local date to ensure correct timezone handling
    exercises: validExercises
  };
}

/**
 * Syncs a single workout to the backend
 * @param {string|number} userId - User ID for scoped storage
 * @param {import('./types').WorkoutSession} workout
 * @returns {Promise<{success: boolean, error?: any, shouldRetry?: boolean}>}
 */
async function syncWorkout(userId, workout) {
  try {
    // Load exercise database to get exercise names (bundled + custom)
    const exercises = await storage.getExercises();
    const customExercises = await storage.getCustomExercises(userId);

    if (!exercises || exercises.length === 0) {
      console.warn('[Sync] Exercise database is empty! Cannot enrich workout with names.');
    }

    const exerciseMap = {};
    exercises.forEach(ex => {
      exerciseMap[ex.id] = ex;
    });
    customExercises.forEach(ex => {
      exerciseMap[ex.id] = { ...ex, isCustom: true };
      if (ex.backendId) exerciseMap[String(ex.backendId)] = { ...ex, isCustom: true };
    });

    // Enrich workout with exercise names and types
    const enrichedWorkout = {
      ...workout,
      exercises: workout.exercises.map(ex => {
        const dbExercise = exerciseMap[ex.exerciseId];
        const exerciseName = dbExercise?.name || ex.exerciseId;
        // Get exerciseType from DB or from the exercise itself
        const exerciseType = ex.exerciseType || dbExercise?.exerciseType || null;

        // Log if exercise ID is not found in database
        if (!dbExercise && ex.exerciseId) {
          console.warn('[Sync] Exercise not found in database:', {
            exerciseId: ex.exerciseId,
            availableExercises: exercises.length,
            fallbackName: exerciseName
          });
        }

        return {
          ...ex,
          exerciseName,
          exerciseType
        };
      })
    };

    const apiData = convertWorkoutToApiFormat(enrichedWorkout, userId);

    // Don't sync workouts with no valid exercises
    if (apiData.exercises.length === 0) {
      console.warn('[Sync] Skipping workout with no valid exercises:', workout.id);
      return {
        success: false,
        error: new Error('Workout has no valid exercises'),
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
 * Syncs pending custom exercises to the backend
 * @param {number} userId
 * @returns {Promise<{synced: number, failed: number}>}
 */
export async function syncPendingCustomExercises(userId) {
  if (!userId) return { synced: 0, failed: 0 };

  const isOnline = await checkNetworkStatus();
  if (!isOnline) return { synced: 0, failed: 0 };

  try {
    const exercises = await storage.getCustomExercises(userId);
    const pending = exercises.filter(e => e.pendingSync);

    if (pending.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;

    for (const ex of pending) {
      try {
        const backendEx = await createCustomExerciseOnBackend({
          userId,
          name: ex.name,
          category: ex.category,
          primaryMuscles: ex.primaryMuscles || [],
          secondaryMuscles: ex.secondaryMuscles || [],
          equipment: ex.equipment,
          difficulty: ex.difficulty,
        });
        await storage.markCustomExerciseSynced(userId, ex.id, backendEx.id);
        synced++;
      } catch (err) {
        console.warn('[Sync] Failed to sync custom exercise:', ex.name, err.message);
        failed++;
      }
    }

    return { synced, failed };
  } catch (error) {
    console.error('[Sync] Error syncing custom exercises:', error);
    return { synced: 0, failed: 0 };
  }
}

/**
 * Syncs all pending workouts to the backend
 * @param {string} userId
 * @returns {Promise<{synced: number, failed: number, errors: any[]}>}
 */
export async function syncPendingWorkouts(userId) {
  if (!userId) {
    return { synced: 0, failed: 0, errors: [] };
  }

  // Check network status first
  const isOnline = await checkNetworkStatus();
  if (!isOnline) {
    return { synced: 0, failed: 0, errors: [] };
  }

  const pendingWorkouts = await storage.getPendingWorkouts(userId);

  if (pendingWorkouts.length === 0) {
    return { synced: 0, failed: 0, errors: [] };
  }

  let synced = 0;
  let failed = 0;
  const errors = [];

  for (const workout of pendingWorkouts) {
    // Skip rest days - they're already posted via RestDayPostModal
    if (workout.type === 'rest_day' || workout.id?.startsWith('rest-')) {
      console.log('[Sync] Skipping rest day, marking as synced:', workout.id);
      await storage.markWorkoutSynced(userId, workout.id);
      synced++;
      continue;
    }

    const result = await syncWorkout(userId, workout);

    if (result.success) {
      // Mark as synced and remove from pending queue
      await storage.markWorkoutSynced(userId, workout.id);
      synced++;
    } else {
      // If this is a server error (5xx) that shouldn't be retried,
      // mark it as synced to prevent infinite retry loop
      if (result.shouldRetry === false) {
        console.warn('[Sync] Marking workout as synced to prevent infinite retry:', workout.id);
        await storage.markWorkoutSynced(userId, workout.id);
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
 * Syncs custom exercises, workouts, and calendar data
 * @param {string} userId
 * @returns {Promise<void>}
 */
export async function backgroundSync(userId) {
  try {
    // Sync custom exercises first (workouts may reference them)
    await syncPendingCustomExercises(userId);

    // Sync pending workouts
    await syncPendingWorkouts(userId);

    // Sync calendar data with backend (bidirectional)
    await syncCalendarWithBackend(userId);
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
