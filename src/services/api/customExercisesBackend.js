/**
 * Custom Exercises Backend API - Axios wrapper for backend custom exercise endpoints
 */

import apiClient from './client';

export const fetchUserCustomExercises = async (userId) => {
  try {
    const response = await apiClient.get(`/custom-exercises/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user custom exercises:', error);
    throw error;
  }
};

export const fetchCustomExerciseById = async (id) => {
  try {
    const response = await apiClient.get(`/custom-exercises/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch custom exercise:', error);
    throw error;
  }
};

export const fetchCustomExercisesByIds = async (ids) => {
  try {
    const response = await apiClient.post(`/custom-exercises/batch`, { ids });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch custom exercises by IDs:', error);
    throw error;
  }
};

export const createCustomExerciseOnBackend = async (data) => {
  try {
    const response = await apiClient.post('/custom-exercises', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create custom exercise on backend:', error);
    throw error;
  }
};

export const updateCustomExerciseOnBackend = async (id, data) => {
  try {
    const response = await apiClient.put(`/custom-exercises/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update custom exercise on backend:', error);
    throw error;
  }
};

export const deleteCustomExerciseOnBackend = async (id) => {
  try {
    const response = await apiClient.delete(`/custom-exercises/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete custom exercise on backend:', error);
    throw error;
  }
};

export const copyCustomExercisesOnBackend = async (sourceExerciseIds, targetUserId) => {
  try {
    const response = await apiClient.post(`/custom-exercises/copy`, { sourceExerciseIds, targetUserId });
    return response.data;
  } catch (error) {
    console.error('Failed to copy custom exercises:', error);
    throw error;
  }
};

export default function CustomExercisesBackendApiPage() {
  return null;
}
