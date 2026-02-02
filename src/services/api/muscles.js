import apiClient from './client';

export const getAllMuscles = async () => {
  try {
    const response = await apiClient.get('/muscles');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch muscles:', error);
    throw error;
  }
};

export const getMuscleById = async (id) => {
  try {
    const response = await apiClient.get(`/muscles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch muscle:', error);
    throw error;
  }
};

export const createMuscle = async (muscleData) => {
  try {
    const response = await apiClient.post('/muscles', muscleData);
    return response.data;
  } catch (error) {
    console.error('Failed to create muscle:', error);
    throw error;
  }
};

export const updateMuscle = async (id, muscleData) => {
  try {
    const response = await apiClient.put(`/muscles/${id}`, muscleData);
    return response.data;
  } catch (error) {
    console.error('Failed to update muscle:', error);
    throw error;
  }
};

export const deleteMuscle = async (id) => {
  try {
    const response = await apiClient.delete(`/muscles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete muscle:', error);
    throw error;
  }
};

export default function MusclesApiPage() {
  return null;
}
