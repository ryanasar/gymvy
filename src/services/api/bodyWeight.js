import apiClient from './client';

export const getBodyWeightEntries = async (userId) => {
  try {
    const response = await apiClient.get(`/body-weights/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch body weight entries:', error);
    throw error;
  }
};

export const createBodyWeightEntry = async (userId, weight, date) => {
  try {
    const response = await apiClient.post(`/body-weights`, {
      userId,
      weight,
      date,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create body weight entry:', error);
    throw error;
  }
};

export const deleteBodyWeightEntry = async (id) => {
  try {
    const response = await apiClient.delete(`/body-weights/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete body weight entry:', error);
    throw error;
  }
};

// Expo Router requires a default export for files in app/
export default null;
