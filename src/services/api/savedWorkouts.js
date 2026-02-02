/**
 * Saved Workouts API - Local-first storage with optional backend sync
 * Uses the same pattern as splits: local storage first, backend sync in background
 */

import { storage } from '@/services/storage/StorageAdapter';

/**
 * Get all saved workouts from local storage
 * @param {number} userId - User ID for user-specific storage
 * @returns {Promise<Array>}
 */
export const getSavedWorkouts = async (userId) => {
  try {
    return await storage.getSavedWorkouts(userId);
  } catch (error) {
    console.error('Failed to fetch saved workouts:', error);
    return [];
  }
};

/**
 * Alias for getSavedWorkouts (for consistency with other APIs)
 * @param {number} userId - User ID for user-specific storage
 * @returns {Promise<Array>}
 */
export const getSavedWorkoutsByUserId = async (userId) => {
  return getSavedWorkouts(userId);
};

/**
 * Get a single saved workout by ID from local storage
 * @param {number} userId - User ID for user-specific storage
 * @param {string} workoutId
 * @returns {Promise<Object|null>}
 */
export const getSavedWorkoutById = async (userId, workoutId) => {
  try {
    return await storage.getSavedWorkout(userId, workoutId);
  } catch (error) {
    console.error('Failed to fetch saved workout:', error);
    return null;
  }
};

/**
 * Create a new saved workout in local storage
 * @param {number} userId - User ID for user-specific storage
 * @param {Object} workoutData - { name, description?, emoji?, workoutType?, exercises? }
 * @returns {Promise<Object>}
 */
export const createSavedWorkout = async (userId, workoutData) => {
  try {
    // Check saved workout limit
    const existingWorkouts = await storage.getSavedWorkouts(userId);
    if (existingWorkouts.length >= 10) {
      throw new Error('You can only have up to 10 saved workouts. Please delete one to create a new one.');
    }

    // Validate exercise limit
    if (workoutData.exercises?.length > 20) {
      throw new Error(`Workout has ${workoutData.exercises.length} exercises. Maximum is 20.`);
    }

    const savedWorkout = await storage.createSavedWorkout(userId, {
      name: workoutData.name,
      description: workoutData.description || null,
      emoji: workoutData.emoji || '💪',
      workoutType: workoutData.workoutType || null,
      exercises: workoutData.exercises || [],
    });

    return savedWorkout;
  } catch (error) {
    console.error('Failed to create saved workout:', error);
    throw error;
  }
};

/**
 * Update a saved workout in local storage
 * @param {number} userId - User ID for user-specific storage
 * @param {string} workoutId
 * @param {Object} updates - { name?, description?, emoji?, workoutType?, exercises? }
 * @returns {Promise<Object|null>}
 */
export const updateSavedWorkout = async (userId, workoutId, updates) => {
  try {
    // Validate exercise limit
    if (updates.exercises?.length > 20) {
      throw new Error(`Workout has ${updates.exercises.length} exercises. Maximum is 20.`);
    }

    return await storage.updateSavedWorkout(userId, workoutId, updates);
  } catch (error) {
    console.error('Failed to update saved workout:', error);
    throw error;
  }
};

/**
 * Delete a saved workout from local storage
 * @param {number} userId - User ID for user-specific storage
 * @param {string} workoutId
 * @returns {Promise<void>}
 */
export const deleteSavedWorkout = async (userId, workoutId) => {
  try {
    await storage.deleteSavedWorkout(userId, workoutId);
  } catch (error) {
    console.error('Failed to delete saved workout:', error);
    throw error;
  }
};

export default function SavedWorkoutsApiPage() {
  return null;
}
