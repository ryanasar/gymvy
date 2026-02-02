import apiClient from './client';

export const getCommentsByPostId = async (postId) => {
  try {
    const response = await apiClient.get(`/comments/post/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    throw error;
  }
};

export const getCommentsByWorkoutPlanId = async (workoutPlanId) => {
  try {
    const response = await apiClient.get(`/comments/workoutplan/${workoutPlanId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    throw error;
  }
};

export const getCommentsByUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/comments/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    throw error;
  }
};

export const getCommentById = async (id) => {
  try {
    const response = await apiClient.get(`/comments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch comment:', error);
    throw error;
  }
};

export const createComment = async (commentData) => {
  try {
    const response = await apiClient.post('/comments', commentData);
    return response.data;
  } catch (error) {
    console.error('Failed to create comment:', error);
    throw error;
  }
};

export const updateComment = async (id, commentData) => {
  try {
    const response = await apiClient.put(`/comments/${id}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Failed to update comment:', error);
    throw error;
  }
};

export const deleteComment = async (id) => {
  try {
    const response = await apiClient.delete(`/comments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete comment:', error);
    throw error;
  }
};

export default function CommentsApiPage() {
  return null;
}
