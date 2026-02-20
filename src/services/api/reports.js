import apiClient from './client';

export const reportPost = async (postId, reason) => {
  const response = await apiClient.post('/reports', { postId, reason });
  return response.data;
};

export const reportComment = async (commentId, reason) => {
  const response = await apiClient.post('/reports', { commentId, reason });
  return response.data;
};
