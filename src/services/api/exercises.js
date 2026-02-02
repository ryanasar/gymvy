import apiClient from './client';

export const getAllExercises = async () => {
  try {
    const response = await apiClient.get('/exercises');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all exercises:', error);
    throw error;
  }
};

export const getExercisesByWorkoutId = async (workoutId) => {
  try {
    const response = await apiClient.get(`/exercises/workout/${workoutId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch exercises:', error);
    throw error;
  }
};

export const getExerciseById = async (id) => {
  try {
    const response = await apiClient.get(`/exercises/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch exercise:', error);
    throw error;
  }
};

export const createExercise = async (exerciseData) => {
  try {
    const response = await apiClient.post('/exercises', exerciseData);
    return response.data;
  } catch (error) {
    console.error('Failed to create exercise:', error);
    throw error;
  }
};

export const updateExercise = async (id, exerciseData) => {
  try {
    const response = await apiClient.put(`/exercises/${id}`, exerciseData);
    return response.data;
  } catch (error) {
    console.error('Failed to update exercise:', error);
    throw error;
  }
};

export const deleteExercise = async (id) => {
  try {
    const response = await apiClient.delete(`/exercises/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete exercise:', error);
    throw error;
  }
};

export const addMuscleToExercise = async (exerciseId, muscleId) => {
  try {
    const response = await apiClient.post(`/exercises/muscle`, {
      exerciseId,
      muscleId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add muscle to exercise:', error);
    throw error;
  }
};

export const removeMuscleFromExercise = async (exerciseId, muscleId) => {
  try {
    const response = await apiClient.delete(`/exercises/${exerciseId}/muscle/${muscleId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to remove muscle from exercise:', error);
    throw error;
  }
};

export default function ExercisesApiPage() {
  return null;
}
