import apiClient from './client';

/**
 * Get splits by userId
 * @param {number} userId
 * @returns {Promise<Array>}
 */
export const getWorkoutPlansByUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/workoutplans/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch splits:', error);
    throw error;
  }
};

/**
 * Create a new split
 * @param {Object} planData
 * @returns {Promise<Object>}
 */
export const createWorkoutPlan = async (planData) => {
  try {
    const response = await apiClient.post('/workoutplans', planData);
    return response.data;
  } catch (error) {
    console.error('Failed to create split:', error);
    throw error;
  }
};

/**
 * Update a split by planId
 * @param {number} planId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export const updateWorkoutPlan = async (planId, updates) => {
  try {
    const response = await apiClient.put(`/workoutplans/${planId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Failed to update split:', error);
    throw error;
  }
};

/**
 * Delete a split by planId
 * @param {number} planId
 * @returns {Promise<Object>}
 */
export const deleteWorkoutPlan = async (planId) => {
  try {
    const response = await apiClient.delete(`/workoutplans/${planId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete split:', error);
    throw error;
  }
};

export default function WorkoutPlansApiPage() {
  return null;
}
