/**
 * App Initialization Logic
 * Handles offline-first startup and data hydration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from './StorageAdapter.js';
import { exercises as exerciseDatabase } from '@/data/exercises/exerciseDatabase';
import { STORAGE_KEYS, LEGACY_KEYS, getUserStorageKey } from './types';

/**
 * Network status check (synchronous version for backward compatibility)
 * @returns {boolean}
 */
export function isOnline() {
  // For backward compatibility, assume online
  // Use checkNetworkStatus() from syncService for actual checks
  return true;
}

/**
 * Converts the existing exercise database to the new format
 * @returns {import('./types').Exercise[]}
 */
function convertExercisesToStorageFormat() {
  return exerciseDatabase.map(exercise => ({
    id: exercise.id.toString(),
    name: exercise.name,
    primaryMuscles: exercise.primaryMuscles || [],
    secondaryMuscles: exercise.secondaryMuscles || [],
    equipment: exercise.equipment || 'unknown',
    category: exercise.category || 'compound',
    difficulty: exercise.difficulty || 'intermediate',
    exerciseType: exercise.exerciseType || 'strength',
    cardioFields: exercise.cardioFields || null,
  }));
}

/**
 * Initializes the exercise database in local storage
 * @returns {Promise<void>}
 */
async function initializeExerciseDatabase() {
  // Always load from bundled database to ensure consistency
  // This ensures the app uses the local exerciseDatabase.js instead of backend data
  const exercises = convertExercisesToStorageFormat();
  await storage.saveExercises(exercises);
}

/**
 * @typedef {Object} AppState
 * @property {import('./types').Split | null} split
 * @property {import('./types').WorkoutSession | null} activeWorkout
 * @property {number} pendingWorkoutsCount
 * @property {boolean} isInitialized
 */

/**
 * Main app initialization function
 * Loads data from local storage first, syncs with backend when online
 * @param {string|number} userId - User ID for scoped storage
 * @returns {Promise<AppState>}
 */
export async function initializeApp(userId) {
  try {
    // Initialize exercise database first (shared across users)
    await initializeExerciseDatabase();

    // If no userId, return empty state
    if (!userId) {
      return {
        split: null,
        activeWorkout: null,
        pendingWorkoutsCount: 0,
        isInitialized: true,
      };
    }

    // Load split from local storage
    const localSplit = await storage.getSplit(userId);

    // Load active workout
    const activeWorkout = await storage.getActiveWorkout(userId);

    // Get pending workouts count
    const pendingWorkouts = await storage.getPendingWorkouts(userId);

    return {
      split: localSplit,
      activeWorkout,
      pendingWorkoutsCount: pendingWorkouts.length,
      isInitialized: true,
    };
  } catch (error) {
    console.error('[initializeApp] Failed to initialize:', error);
    // Return safe defaults even if initialization fails
    return {
      split: null,
      activeWorkout: null,
      pendingWorkoutsCount: 0,
      isInitialized: false,
    };
  }
}

/**
 * Migrates old WorkoutContext data to new storage format
 * @param {string|number} userId - User ID for scoped storage
 * @param {any} oldSplit - Old split data from WorkoutContext
 * @returns {Promise<void>}
 */
export async function migrateOldWorkoutData(userId, oldSplit) {
  try {
    // Check if we already have a split in new storage
    const existingSplit = await storage.getSplit(userId);
    if (existingSplit) {
      return;
    }

    if (!oldSplit) {
      return;
    }

    // Convert old split format to new format
    const newSplit = {
      id: oldSplit.id?.toString() || 'migrated_split',
      name: oldSplit.name || 'My Split',
      description: oldSplit.description,
      emoji: oldSplit.emoji,
      totalDays: oldSplit.totalDays || oldSplit.workoutDays?.length || 0,
      days: (oldSplit.workoutDays || []).map((day, index) => ({
        dayIndex: index,
        name: day.name || day.workoutName,
        type: day.type || day.workoutType,
        emoji: day.emoji,
        isRest: day.isRest || false,
        exercises: (day.exercises || []).map((exercise) => ({
          exerciseId: exercise.id?.toString() || exercise.name,
          targetSets: parseInt(exercise.sets) || 3,
          targetReps: parseInt(exercise.reps) || 10,
        })),
      })),
      lastSyncedAt: Date.now(),
    };

    await storage.saveSplit(userId, newSplit);
  } catch (error) {
    console.error('[migrateOldWorkoutData] Error:', error);
    // Silent fail
  }
}

/**
 * Migrate legacy storage keys (without userId suffix) to user-specific keys
 * Should be called on login to ensure data isolation between users
 * @param {string|number} userId - User ID to migrate data to
 * @returns {Promise<{migrated: boolean, keysProcessed: number}>}
 */
export async function migrateUserStorage(userId) {
  if (!userId) {
    return { migrated: false, keysProcessed: 0 };
  }

  let keysProcessed = 0;

  try {
    // Define legacy keys and their new user-scoped counterparts
    // Note: CUSTOM_EXERCISES and CALENDAR are now backend-only, no longer migrated
    const keyMappings = [
      { legacy: LEGACY_KEYS.ACTIVE_SPLIT, storage: STORAGE_KEYS.ACTIVE_SPLIT },
      { legacy: LEGACY_KEYS.ACTIVE_WORKOUT, storage: STORAGE_KEYS.ACTIVE_WORKOUT },
      { legacy: LEGACY_KEYS.PENDING_WORKOUTS, storage: STORAGE_KEYS.PENDING_WORKOUTS },
      { legacy: LEGACY_KEYS.COMPLETED_WORKOUTS, storage: STORAGE_KEYS.COMPLETED_WORKOUTS },
      { legacy: LEGACY_KEYS.LAST_SYNC, storage: STORAGE_KEYS.LAST_SYNC },
      { legacy: LEGACY_KEYS.SAVED_WORKOUTS, storage: STORAGE_KEYS.SAVED_WORKOUTS },
      { legacy: LEGACY_KEYS.BODY_WEIGHT_LOG, storage: STORAGE_KEYS.BODY_WEIGHT_LOG },
    ];

    for (const { legacy, storage: storageKey } of keyMappings) {
      try {
        // Check if legacy key has data
        const legacyData = await AsyncStorage.getItem(legacy);

        if (legacyData) {
          const newKey = getUserStorageKey(storageKey, userId);

          // Check if new key already has data (don't overwrite)
          const existingData = await AsyncStorage.getItem(newKey);

          if (!existingData) {
            // Migrate data to new user-specific key
            await AsyncStorage.setItem(newKey, legacyData);
          }

          // Remove legacy key after successful migration
          await AsyncStorage.removeItem(legacy);
          keysProcessed++;
        }
      } catch (keyError) {
        // Silent fail
      }
    }

    return { migrated: keysProcessed > 0, keysProcessed };
  } catch (error) {
    console.error('[migrateUserStorage] Migration failed:', error);
    return { migrated: false, keysProcessed };
  }
}

/**
 * Check if there's any legacy data that needs migration
 * @returns {Promise<boolean>}
 */
export async function hasLegacyData() {
  try {
    const legacyKeys = Object.values(LEGACY_KEYS);

    for (const key of legacyKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[hasLegacyData] Error checking legacy data:', error);
    return false;
  }
}
