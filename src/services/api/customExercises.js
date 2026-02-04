/**
 * Custom Exercises API - Backend-only (no local cache)
 * Custom exercises require an internet connection.
 */

import { checkNetworkStatus } from '@/services/network/networkService';
import {
  fetchUserCustomExercises,
  fetchCustomExerciseById as fetchById,
  createCustomExerciseOnBackend,
  deleteCustomExerciseOnBackend,
  copyCustomExercisesOnBackend,
} from './customExercisesBackend';

/**
 * Get all custom exercises from backend.
 * Returns empty array when offline.
 * @param {number} userId - User ID for backend fetch
 * @returns {Promise<Array>}
 */
export const getCustomExercises = async (userId) => {
  try {
    if (!userId) return [];

    const isOnline = await checkNetworkStatus();
    if (!isOnline) {
      console.warn('[CustomExercisesApi] Offline - returning empty array');
      return [];
    }

    const exercises = await fetchUserCustomExercises(userId);
    return exercises || [];
  } catch (error) {
    console.error('Failed to fetch custom exercises:', error);
    return [];
  }
};

/**
 * Get a single custom exercise by ID from backend.
 * Returns null when offline.
 * @param {number} userId - User ID (unused, kept for API compatibility)
 * @param {string|number} exerciseId - Backend exercise ID
 * @returns {Promise<Object|null>}
 */
export const getCustomExerciseById = async (userId, exerciseId) => {
  try {
    const numericId = parseInt(exerciseId);
    if (isNaN(numericId)) return null;

    const isOnline = await checkNetworkStatus();
    if (!isOnline) {
      console.warn('[CustomExercisesApi] Offline - cannot fetch exercise');
      return null;
    }

    return await fetchById(numericId);
  } catch (error) {
    console.error('Failed to fetch custom exercise:', error);
    return null;
  }
};

/**
 * Create a new custom exercise on the backend.
 * Throws error when offline - custom exercises require internet.
 * @param {number} userId - User ID for backend creation
 * @param {Object} exerciseData - { name, category?, primaryMuscles?, secondaryMuscles?, equipment?, difficulty? }
 * @returns {Promise<Object>}
 */
export const createCustomExercise = async (userId, exerciseData) => {
  if (!exerciseData.name?.trim()) {
    throw new Error('Exercise name is required');
  }

  const isOnline = await checkNetworkStatus();
  if (!isOnline) {
    throw new Error('Custom exercises require an internet connection');
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  const exercisePayload = {
    userId,
    name: exerciseData.name.trim(),
    category: exerciseData.category || null,
    primaryMuscles: exerciseData.primaryMuscles || [],
    secondaryMuscles: exerciseData.secondaryMuscles || [],
    equipment: exerciseData.equipment || null,
    difficulty: exerciseData.difficulty || null,
  };

  return await createCustomExerciseOnBackend(exercisePayload);
};

/**
 * Update a custom exercise - NOT SUPPORTED in backend-only mode
 * @deprecated Updates are not supported without local storage
 */
export const updateCustomExercise = async () => {
  throw new Error('Updating custom exercises is not currently supported');
};

/**
 * Delete a custom exercise from backend.
 * Throws error when offline.
 * @param {number} userId - User ID (unused, kept for API compatibility)
 * @param {string|number} exerciseId - Backend exercise ID
 * @returns {Promise<void>}
 */
export const deleteCustomExercise = async (userId, exerciseId) => {
  const isOnline = await checkNetworkStatus();
  if (!isOnline) {
    throw new Error('Deleting custom exercises requires an internet connection');
  }

  const numericId = parseInt(exerciseId);
  if (isNaN(numericId)) {
    throw new Error('Invalid exercise ID');
  }

  await deleteCustomExerciseOnBackend(numericId);
};

/**
 * Copy custom exercises from a source user to a target user via backend
 * @param {number} targetUserId - User ID to copy to
 * @param {number[]} sourceExerciseIds - Backend IDs of exercises to copy
 * @returns {Promise<{idMapping: Object, exercises: Array}>}
 */
export const copyCustomExercises = async (targetUserId, sourceExerciseIds) => {
  const isOnline = await checkNetworkStatus();
  if (!isOnline) {
    throw new Error('Copying custom exercises requires an internet connection');
  }

  return await copyCustomExercisesOnBackend(sourceExerciseIds, targetUserId);
};

export default function CustomExercisesApiPage() {
  return null;
}
