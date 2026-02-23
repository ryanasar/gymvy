/**
 * StorageAdapter - Abstraction layer for local storage
 * This adapter ensures the app never depends on live network calls for workouts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, SHARED_KEYS, getUserStorageKey } from './types';

/**
 * AsyncStorageAdapter - Implementation using React Native AsyncStorage
 */
export class AsyncStorageAdapter {
  // ==================== Split Operations ====================

  /**
   * Get the active split from storage
   * @param {string|number} userId - User ID for scoped storage
   * @returns {Promise<import('./types').Split | null>}
   */
  async getSplit(userId) {
    try {
      const key = getUserStorageKey(STORAGE_KEYS.ACTIVE_SPLIT, userId);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[StorageAdapter] Failed to get split:', error);
      return null;
    }
  }

  /**
   * Save a split to storage
   * @param {string|number} userId - User ID for scoped storage
   * @param {import('./types').Split} split
   * @returns {Promise<void>}
   */
  async saveSplit(userId, split) {
    try {
      const key = getUserStorageKey(STORAGE_KEYS.ACTIVE_SPLIT, userId);
      await AsyncStorage.setItem(key, JSON.stringify(split));
    } catch (error) {
      console.error('[StorageAdapter] Failed to save split:', error);
      throw error;
    }
  }

  // ==================== Active Workout Operations ====================

  /**
   * Get the active workout from storage
   * @param {string|number} userId - User ID for scoped storage
   * @returns {Promise<import('./types').WorkoutSession | null>}
   */
  async getActiveWorkout(userId) {
    try {
      if (!userId) return null;
      const key = getUserStorageKey(STORAGE_KEYS.ACTIVE_WORKOUT, userId);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[StorageAdapter] Failed to get active workout:', error);
      return null;
    }
  }

  /**
   * Save an active workout to storage
   * @param {string|number} userId - User ID for scoped storage
   * @param {import('./types').WorkoutSession} workout
   * @returns {Promise<void>}
   */
  async saveActiveWorkout(userId, workout) {
    try {
      const key = getUserStorageKey(STORAGE_KEYS.ACTIVE_WORKOUT, userId);
      await AsyncStorage.setItem(key, JSON.stringify(workout));
    } catch (error) {
      console.error('[StorageAdapter] Failed to save active workout:', error);
      throw error;
    }
  }

  /**
   * Clear the active workout from storage
   * @param {string|number} userId - User ID for scoped storage
   * @returns {Promise<void>}
   */
  async clearActiveWorkout(userId) {
    try {
      const key = getUserStorageKey(STORAGE_KEYS.ACTIVE_WORKOUT, userId);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[StorageAdapter] Failed to clear active workout:', error);
      throw error;
    }
  }

  /**
   * Complete a workout and move it to pending sync
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} workoutId
   * @returns {Promise<void>}
   */
  async completeWorkout(userId, workoutId) {
    // Normalize userId to string for consistent storage key generation
    const normalizedUserId = String(userId);

    try {
      // Get active workout
      const activeWorkout = await this.getActiveWorkout(normalizedUserId);

      if (!activeWorkout || activeWorkout.id !== workoutId) {
        return;
      }

      // Mark as completed
      activeWorkout.completedAt = Date.now();
      activeWorkout.pendingSync = true;

      // Add to pending, completed history, and clear active workout in parallel
      // These write to different storage keys so they're safe to parallelize
      await Promise.all([
        this.addToPendingWorkouts(normalizedUserId, activeWorkout),
        this.addToCompletedHistory(normalizedUserId, activeWorkout),
        this.clearActiveWorkout(normalizedUserId),
      ]);
    } catch (error) {
      console.error('[StorageAdapter] Failed to complete workout:', error);
      throw error;
    }
  }

  // ==================== Pending Workout Operations ====================

  /**
   * Get all pending workouts
   * @param {string|number} userId - User ID for scoped storage
   * @returns {Promise<import('./types').WorkoutSession[]>}
   */
  async getPendingWorkouts(userId) {
    // Normalize userId to string for consistent storage key generation
    const normalizedUserId = String(userId);

    try {
      const key = getUserStorageKey(STORAGE_KEYS.PENDING_WORKOUTS, normalizedUserId);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[StorageAdapter] Failed to get pending workouts:', error);
      return [];
    }
  }

  /**
   * Add a workout to the pending sync queue
   * @param {string|number} userId - User ID for scoped storage
   * @param {import('./types').WorkoutSession} workout
   * @returns {Promise<void>}
   */
  async addToPendingWorkouts(userId, workout) {
    // Normalize userId to string for consistent storage key generation
    const normalizedUserId = String(userId);

    try {
      const pending = await this.getPendingWorkouts(normalizedUserId);
      pending.push(workout);
      const key = getUserStorageKey(STORAGE_KEYS.PENDING_WORKOUTS, normalizedUserId);
      await AsyncStorage.setItem(key, JSON.stringify(pending));
    } catch (error) {
      console.error('[StorageAdapter] Failed to add to pending workouts:', error);
      throw error;
    }
  }

  /**
   * Mark a workout as synced and remove from pending queue
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} workoutId
   * @returns {Promise<void>}
   */
  async markWorkoutSynced(userId, workoutId) {
    // Normalize userId to string for consistent storage key generation
    const normalizedUserId = String(userId);

    try {
      const pending = await this.getPendingWorkouts(normalizedUserId);
      const filtered = pending.filter(w => w.id !== workoutId);
      const key = getUserStorageKey(STORAGE_KEYS.PENDING_WORKOUTS, normalizedUserId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('[StorageAdapter] Failed to mark workout synced:', error);
      throw error;
    }
  }

  /**
   * Update a pending workout's fields (e.g. syncAttempts counter)
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} workoutId
   * @param {Object} updates - Fields to merge into the workout object
   * @returns {Promise<void>}
   */
  async updatePendingWorkout(userId, workoutId, updates) {
    const normalizedUserId = String(userId);

    try {
      const pending = await this.getPendingWorkouts(normalizedUserId);
      const updated = pending.map(w => w.id === workoutId ? { ...w, ...updates } : w);
      const key = getUserStorageKey(STORAGE_KEYS.PENDING_WORKOUTS, normalizedUserId);
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('[StorageAdapter] Failed to update pending workout:', error);
    }
  }

  /**
   * Get all completed workouts (from pending sync queue)
   * @param {string|number} userId - User ID for scoped storage
   * @returns {Promise<import('./types').WorkoutSession[]>}
   */
  async getCompletedWorkouts(userId) {
    try {
      const pending = await this.getPendingWorkouts(userId);
      return pending.filter(w => w.completedAt);
    } catch (error) {
      console.error('[StorageAdapter] Failed to get completed workouts:', error);
      return [];
    }
  }

  // ==================== Completed Workouts History ====================

  /**
   * Get completed workouts history (persists after sync)
   * @param {string|number} userId - User ID for scoped storage
   * @returns {Promise<import('./types').WorkoutSession[]>}
   */
  async getCompletedHistory(userId) {
    try {
      const key = getUserStorageKey(STORAGE_KEYS.COMPLETED_WORKOUTS, userId);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[StorageAdapter] Failed to get completed history:', error);
      return [];
    }
  }

  /**
   * Remove a workout from the completed history
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} workoutId
   * @returns {Promise<void>}
   */
  async removeFromCompletedHistory(userId, workoutId) {
    try {
      const history = await this.getCompletedHistory(userId);
      const filtered = history.filter(w => w.id !== workoutId);
      const key = getUserStorageKey(STORAGE_KEYS.COMPLETED_WORKOUTS, userId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('[StorageAdapter] Failed to remove from completed history:', error);
      throw error;
    }
  }

  /**
   * Add a workout to the completed history
   * @param {string|number} userId - User ID for scoped storage
   * @param {import('./types').WorkoutSession} workout
   * @returns {Promise<void>}
   */
  async addToCompletedHistory(userId, workout) {
    try {
      const history = await this.getCompletedHistory(userId);

      // Check if this workout is already in history (avoid duplicates)
      const exists = history.some(w => w.id === workout.id);
      if (exists) {
        return;
      }

      // Add workout to history
      history.push(workout);

      // Keep only last 90 days of workouts
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      const filtered = history.filter(w => w.completedAt && w.completedAt >= ninetyDaysAgo);

      const key = getUserStorageKey(STORAGE_KEYS.COMPLETED_WORKOUTS, userId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('[StorageAdapter] Failed to add to completed history:', error);
      throw error;
    }
  }

  /**
   * Check if a specific workout day is completed today
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} splitId
   * @param {number} dayIndex
   * @returns {Promise<import('./types').WorkoutSession | null>}
   */
  async getTodaysCompletedWorkout(userId, splitId, dayIndex) {
    try {
      // Check completed history instead of pending queue
      // This persists even after workouts are synced
      const completed = await this.getCompletedHistory(userId);

      // Get today's date in local timezone as YYYY-MM-DD
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // Find workout completed today that matches split and day
      return completed.find(workout => {
        if (workout.splitId !== splitId || workout.dayIndex !== dayIndex) {
          return false;
        }

        // Convert completedAt to local date string
        const completedDate = new Date(workout.completedAt);
        const completedStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;

        return completedStr === todayStr;
      }) || null;
    } catch (error) {
      console.error('[StorageAdapter] Failed to check today\'s workout:', error);
      return null;
    }
  }

  // ==================== Exercise Database Operations ====================
  // Note: Exercise database is SHARED across all users (uses SHARED_KEYS)

  /**
   * Get all exercises from storage
   * @returns {Promise<import('./types').Exercise[]>}
   */
  async getExercises() {
    try {
      const data = await AsyncStorage.getItem(SHARED_KEYS.EXERCISE_DATABASE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[StorageAdapter] Failed to get exercises:', error);
      return [];
    }
  }

  /**
   * Save exercises to storage
   * @param {import('./types').Exercise[]} exercises
   * @returns {Promise<void>}
   */
  async saveExercises(exercises) {
    try {
      await AsyncStorage.setItem(SHARED_KEYS.EXERCISE_DATABASE, JSON.stringify(exercises));
    } catch (error) {
      console.error('[StorageAdapter] Failed to save exercises:', error);
      throw error;
    }
  }

  // ==================== Workout ID Mapping ====================

  /**
   * Store mapping between local workout ID and database workout session ID
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} localId - Local workout ID (e.g., "workout_123_abc")
   * @param {number} databaseId - Database workout session ID
   * @returns {Promise<void>}
   */
  async setWorkoutDatabaseId(userId, localId, databaseId) {
    try {
      const baseKey = getUserStorageKey(STORAGE_KEYS.WORKOUT_ID_MAP, userId);
      const key = `${baseKey}:${localId}`;
      await AsyncStorage.setItem(key, databaseId.toString());
    } catch (error) {
      console.error('[StorageAdapter] Failed to set workout database ID:', error);
      throw error;
    }
  }

  /**
   * Get database workout session ID from local workout ID
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} localId - Local workout ID
   * @returns {Promise<number | null>}
   */
  async getWorkoutDatabaseId(userId, localId) {
    try {
      const baseKey = getUserStorageKey(STORAGE_KEYS.WORKOUT_ID_MAP, userId);
      const key = `${baseKey}:${localId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? parseInt(data, 10) : null;
    } catch (error) {
      console.error('[StorageAdapter] Failed to get workout database ID:', error);
      return null;
    }
  }

  /**
   * Delete database workout session ID mapping
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} localId - Local workout ID
   * @returns {Promise<void>}
   */
  async deleteWorkoutDatabaseId(userId, localId) {
    try {
      const baseKey = getUserStorageKey(STORAGE_KEYS.WORKOUT_ID_MAP, userId);
      const key = `${baseKey}:${localId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[StorageAdapter] Failed to delete workout database ID:', error);
      throw error;
    }
  }

  // ==================== Saved Workout Operations ====================

  /**
   * Get all saved workouts from local storage
   * @param {string|number} userId - User ID for scoped storage
   * @returns {Promise<import('./types').SavedWorkout[]>}
   */
  async getSavedWorkouts(userId) {
    try {
      const key = getUserStorageKey(STORAGE_KEYS.SAVED_WORKOUTS, userId);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[StorageAdapter] Failed to get saved workouts:', error);
      return [];
    }
  }

  /**
   * Get a single saved workout by ID
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} workoutId - Local workout ID
   * @returns {Promise<import('./types').SavedWorkout | null>}
   */
  async getSavedWorkout(userId, workoutId) {
    try {
      const workouts = await this.getSavedWorkouts(userId);
      return workouts.find(w => w.id === workoutId) || null;
    } catch (error) {
      console.error('[StorageAdapter] Failed to get saved workout:', error);
      return null;
    }
  }

  /**
   * Save a new workout to local storage
   * @param {string|number} userId - User ID for scoped storage
   * @param {import('./types').SavedWorkout} workout
   * @returns {Promise<import('./types').SavedWorkout>}
   */
  async createSavedWorkout(userId, workout) {
    try {
      const workouts = await this.getSavedWorkouts(userId);

      // Generate local ID if not provided
      const newWorkout = {
        ...workout,
        id: workout.id || `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: workout.createdAt || Date.now(),
        updatedAt: Date.now(),
        pendingSync: true,
      };

      workouts.push(newWorkout);
      const key = getUserStorageKey(STORAGE_KEYS.SAVED_WORKOUTS, userId);
      await AsyncStorage.setItem(key, JSON.stringify(workouts));

      return newWorkout;
    } catch (error) {
      console.error('[StorageAdapter] Failed to create saved workout:', error);
      throw error;
    }
  }

  /**
   * Update a saved workout in local storage
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} workoutId - Local workout ID
   * @param {Partial<import('./types').SavedWorkout>} updates
   * @returns {Promise<import('./types').SavedWorkout | null>}
   */
  async updateSavedWorkout(userId, workoutId, updates) {
    try {
      const workouts = await this.getSavedWorkouts(userId);
      const index = workouts.findIndex(w => w.id === workoutId);

      if (index === -1) {
        return null;
      }

      workouts[index] = {
        ...workouts[index],
        ...updates,
        updatedAt: Date.now(),
        pendingSync: true,
      };

      const key = getUserStorageKey(STORAGE_KEYS.SAVED_WORKOUTS, userId);
      await AsyncStorage.setItem(key, JSON.stringify(workouts));
      return workouts[index];
    } catch (error) {
      console.error('[StorageAdapter] Failed to update saved workout:', error);
      throw error;
    }
  }

  /**
   * Delete a saved workout from local storage
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} workoutId - Local workout ID
   * @returns {Promise<void>}
   */
  async deleteSavedWorkout(userId, workoutId) {
    try {
      const workouts = await this.getSavedWorkouts(userId);
      const filtered = workouts.filter(w => w.id !== workoutId);
      const key = getUserStorageKey(STORAGE_KEYS.SAVED_WORKOUTS, userId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('[StorageAdapter] Failed to delete saved workout:', error);
      throw error;
    }
  }

  /**
   * Mark a saved workout as synced with backend
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} localId - Local workout ID
   * @param {number} backendId - Backend workout ID
   * @returns {Promise<void>}
   */
  async markSavedWorkoutSynced(userId, localId, backendId) {
    try {
      const workouts = await this.getSavedWorkouts(userId);
      const index = workouts.findIndex(w => w.id === localId);

      if (index !== -1) {
        workouts[index].pendingSync = false;
        workouts[index].backendId = backendId;
        const key = getUserStorageKey(STORAGE_KEYS.SAVED_WORKOUTS, userId);
        await AsyncStorage.setItem(key, JSON.stringify(workouts));
      }
    } catch (error) {
      console.error('[StorageAdapter] Failed to mark saved workout synced:', error);
      throw error;
    }
  }

  // ==================== Rest Day Operations ====================

  /**
   * Save a rest day completion
   * @param {string|number} userId - User ID for scoped storage
   * @param {Object} restDayData - Rest day data including date, activities, caption
   * @returns {Promise<void>}
   */
  async saveRestDayCompletion(userId, restDayData) {
    try {
      const restDayWithId = {
        ...restDayData,
        id: `rest-${Date.now()}`,
        type: 'rest_day',
        pendingSync: true,
      };

      // Add to pending workouts for sync (treat as a workout completion)
      await this.addToPendingWorkouts(userId, restDayWithId);
    } catch (error) {
      console.error('[StorageAdapter] Failed to save rest day completion:', error);
      throw error;
    }
  }

  /**
   * Remove pending rest day entries for a specific date
   * Used when undoing a rest day or switching from rest to workout day
   * @param {string|number} userId - User ID for scoped storage
   * @param {string} dateStr - Date string in YYYY-MM-DD format
   * @returns {Promise<number>} Number of entries removed
   */
  async removePendingRestDaysByDate(userId, dateStr) {
    const normalizedUserId = String(userId);
    try {
      const pending = await this.getPendingWorkouts(normalizedUserId);
      const filtered = pending.filter(item => {
        if (item.type !== 'rest_day' && !item.id?.startsWith('rest-')) return true;
        if (item.date) {
          const d = new Date(item.date);
          const itemDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return itemDateStr !== dateStr;
        }
        return true;
      });
      const key = getUserStorageKey(STORAGE_KEYS.PENDING_WORKOUTS, normalizedUserId);
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
      const removed = pending.length - filtered.length;
      return removed;
    } catch (error) {
      console.error('[StorageAdapter] Failed to remove pending rest days:', error);
      return 0;
    }
  }

  // ==================== Cleanup Operations ====================

  /**
   * Clear all Gymvy storage data for a specific user
   * @param {string|number} userId - User ID for scoped storage
   * @returns {Promise<void>}
   */
  async clearAllUserData(userId) {
    try {
      const userKeys = Object.values(STORAGE_KEYS).map(key => getUserStorageKey(key, userId));
      await AsyncStorage.multiRemove(userKeys);
    } catch (error) {
      console.error('[StorageAdapter] Failed to clear all user data:', error);
      throw error;
    }
  }

  /**
   * Clear only the pending workouts queue for a user
   * @param {string|number} userId - User ID for scoped storage
   * @returns {Promise<void>}
   */
  async clearPendingWorkouts(userId) {
    try {
      const key = getUserStorageKey(STORAGE_KEYS.PENDING_WORKOUTS, userId);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[StorageAdapter] Failed to clear pending workouts:', error);
      throw error;
    }
  }

  /**
   * Clear the completed workouts history for a user
   * @param {string|number} userId - User ID for scoped storage
   * @returns {Promise<void>}
   */
  async clearCompletedHistory(userId) {
    try {
      const key = getUserStorageKey(STORAGE_KEYS.COMPLETED_WORKOUTS, userId);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[StorageAdapter] Failed to clear completed history:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const storage = new AsyncStorageAdapter();
