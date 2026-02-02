import apiClient from './client';

export const getLikesByPostId = async (postId) => {
  try {
    const response = await apiClient.get(`/likes/post/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch likes:', error);
    throw error;
  }
};

export const getLikesByWorkoutPlanId = async (workoutPlanId) => {
  try {
    const response = await apiClient.get(`/likes/workoutplan/${workoutPlanId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch likes:', error);
    throw error;
  }
};

export const getLikesByUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/likes/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch likes:', error);
    throw error;
  }
};

export const createLike = async (likeData) => {
  try {
    const response = await apiClient.post('/likes', likeData);
    return response.data;
  } catch (error) {
    console.error('Failed to create like:', error);
    throw error;
  }
};

export const deleteLike = async (id) => {
  try {
    const response = await apiClient.delete(`/likes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete like:', error);
    throw error;
  }
};

export const toggleLike = async (likeData) => {
  try {
    const response = await apiClient.post(`/likes/toggle`, likeData);
    return response.data;
  } catch (error) {
    console.error('Failed to toggle like:', error);
    throw error;
  }
};

export default function LikesApiPage() {
  return null;
}
