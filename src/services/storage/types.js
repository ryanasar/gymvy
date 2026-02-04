/**
 * Offline-First Storage Types for Gymvy
 * These types define the local-first data model for workouts
 */

/**
 * @typedef {Object} Exercise
 * @property {string} id
 * @property {string} name
 * @property {string[]} primaryMuscles
 * @property {string[]} secondaryMuscles
 * @property {string} equipment
 */

/**
 * @typedef {Object} SplitExercise
 * @property {string} exerciseId
 * @property {number} targetSets
 * @property {number} targetReps
 */

/**
 * @typedef {Object} SplitDay
 * @property {number} dayIndex
 * @property {string} [name]
 * @property {string} [type]
 * @property {string} [emoji]
 * @property {boolean} [isRest]
 * @property {SplitExercise[]} exercises
 */

/**
 * @typedef {Object} Split
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [emoji]
 * @property {number} totalDays
 * @property {SplitDay[]} days
 * @property {number} lastSyncedAt
 */

/**
 * @typedef {Object} WorkoutSet
 * @property {number} setIndex
 * @property {number} reps
 * @property {number} weight
 * @property {boolean} completed
 */

/**
 * @typedef {Object} WorkoutExercise
 * @property {string} exerciseId
 * @property {WorkoutSet[]} sets
 */

/**
 * @typedef {Object} WorkoutSession
 * @property {string} id
 * @property {string} splitId
 * @property {number} dayIndex
 * @property {number} startedAt
 * @property {number} [completedAt]
 * @property {WorkoutExercise[]} exercises
 * @property {boolean} pendingSync
 */

/**
 * @typedef {Object} SavedWorkout
 * @property {string} id - Local ID (e.g., "saved_123456789_abc")
 * @property {string} name
 * @property {string} [description]
 * @property {string} [emoji]
 * @property {string} [workoutType]
 * @property {Object[]} exercises - Exercise configurations
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {boolean} [pendingSync] - Needs backend upload
 * @property {number} [backendId] - ID from backend after sync
 */

/**
 * @typedef {Object} CustomExercise
 * @property {string} id - Local ID (e.g., "custom_123456789_abc")
 * @property {string} name
 * @property {string} [category] - 'compound' or 'isolation'
 * @property {string[]} [primaryMuscles]
 * @property {string[]} [secondaryMuscles]
 * @property {string} [equipment] - 'barbell', 'dumbbells', 'cable', 'machine', 'bodyweight', 'pull_up_bar', 'trap_bar'
 * @property {string} [difficulty] - 'beginner', 'intermediate', 'advanced'
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {boolean} [pendingSync] - Needs backend upload
 * @property {number} [backendId] - ID from backend after sync
 */

// Storage Keys - User-specific (require userId suffix)
export const STORAGE_KEYS = {
  ACTIVE_SPLIT: '@gymvy/active_split',
  ACTIVE_WORKOUT: '@gymvy/active_workout',
  PENDING_WORKOUTS: '@gymvy/pending_workouts',
  COMPLETED_WORKOUTS: '@gymvy/completed_workouts',
  LAST_SYNC: '@gymvy/last_sync',
  WORKOUT_ID_MAP: '@gymvy/workout_id_map',
  SAVED_WORKOUTS: '@gymvy/saved_workouts',
  BODY_WEIGHT_LOG: '@gymvy/body_weight_log',
  // CUSTOM_EXERCISES - REMOVED: custom exercises are now backend-only
  // CALENDAR - REMOVED: calendar is now backend-only (DailyActivity table)
};

// Shared keys - NOT user-specific (same for all users on device)
export const SHARED_KEYS = {
  EXERCISE_DATABASE: '@gymvy/exercise_database',
};

/**
 * Get a user-specific storage key
 * @param {string} baseKey - The base storage key from STORAGE_KEYS
 * @param {string|number} userId - The user's ID
 * @returns {string} User-scoped storage key
 */
export const getUserStorageKey = (baseKey, userId) => {
  if (!userId) {
    throw new Error('userId required for user-specific storage');
  }
  return `${baseKey}:${userId}`;
};

/**
 * Legacy storage keys (without userId suffix) for migration
 */
export const LEGACY_KEYS = {
  ACTIVE_SPLIT: '@gymvy/active_split',
  ACTIVE_WORKOUT: '@gymvy/active_workout',
  PENDING_WORKOUTS: '@gymvy/pending_workouts',
  COMPLETED_WORKOUTS: '@gymvy/completed_workouts',
  LAST_SYNC: '@gymvy/last_sync',
  SAVED_WORKOUTS: '@gymvy/saved_workouts',
  BODY_WEIGHT_LOG: '@gymvy/body_weight_log',
  // CUSTOM_EXERCISES - REMOVED: custom exercises are now backend-only
  // CALENDAR - REMOVED: calendar is now backend-only
};
