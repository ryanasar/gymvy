import apiClient from './client';

export const getWorkoutsByUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/workouts/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch workouts:', error);
    throw error;
  }
};

export const getWorkoutById = async (id) => {
  try {
    const response = await apiClient.get(`/workouts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch workout:', error);
    throw error;
  }
};

export const createWorkout = async (workoutData) => {
  try {
    const response = await apiClient.post('/workouts', workoutData);
    return response.data;
  } catch (error) {
    console.error('Failed to create workout:', error);
    throw error;
  }
};

export const updateWorkout = async (id, workoutData) => {
  try {
    const response = await apiClient.put(`/workouts/${id}`, workoutData);
    return response.data;
  } catch (error) {
    console.error('Failed to update workout:', error);
    throw error;
  }
};

export const deleteWorkout = async (id) => {
  try {
    const response = await apiClient.delete(`/workouts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete workout:', error);
    throw error;
  }
};

export default function WorkoutsApiPage() {
  return null;
}
