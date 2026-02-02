import apiClient from './client';

export const getAllAchievements = async () => {
  try {
    const response = await apiClient.get('/achievements');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
    throw error;
  }
};

export const getAchievementsByUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/achievements/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
    throw error;
  }
};

export const getAchievementById = async (id) => {
  try {
    const response = await apiClient.get(`/achievements/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch achievement:', error);
    throw error;
  }
};

export const createAchievement = async (achievementData) => {
  try {
    const response = await apiClient.post('/achievements', achievementData);
    return response.data;
  } catch (error) {
    console.error('Failed to create achievement:', error);
    throw error;
  }
};

export const deleteAchievement = async (id) => {
  try {
    const response = await apiClient.delete(`/achievements/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete achievement:', error);
    throw error;
  }
};

export default function AchievementsApiPage() {
  return null;
}
