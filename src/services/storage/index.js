/**
 * Storage Module - Offline-First Data Layer
 *
 * This module provides the complete storage abstraction for Gymvy's offline-first architecture.
 * All user-specific data requires userId parameter for multi-user isolation.
 *
 * Usage:
 *   import { storage, startWorkout, completeWorkout, initializeApp } from '@/services/storage';
 */

// Core storage adapter
export { storage, AsyncStorageAdapter } from './StorageAdapter.js';

// Workout helpers
export {
  startWorkout,
  startFreestyleWorkout,
  startSavedWorkout,
  updateWorkoutSet,
  completeWorkout,
  getActiveWorkout,
  cancelWorkout,
  generateWorkoutId,
  buildWorkoutFromSplit,
  calculateStreakFromLocal,
  createCompletedWorkoutSession,
} from './workoutHelpers.js';

// App initialization and migration
export {
  initializeApp,
  migrateOldWorkoutData,
  migrateUserStorage,
  hasLegacyData,
  isOnline,
} from './initializeApp.js';

// Sync service
export {
  syncPendingWorkouts,
  syncPendingCustomExercises,
  backgroundSync,
  getSyncStatus,
  checkNetworkStatus,
} from './syncService.js';

// Calendar storage
export {
  getCalendarData,
  markTodayCompleted,
  unmarkTodayCompleted,
  isTodayCompleted,
  getCalendarDataForDisplay,
  backfillCalendarFromBackend,
  syncCalendarWithBackend,
  clearCalendarData,
} from './calendarStorage.js';

// Body weight storage
export {
  getBodyWeightLog,
  addBodyWeightEntry,
  clearBodyWeightLog,
} from './bodyWeightStorage.js';

// Types and utilities
export { STORAGE_KEYS, SHARED_KEYS, LEGACY_KEYS, getUserStorageKey } from './types.js';
