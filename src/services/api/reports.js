import apiClient from './client';

export const reportPost = async (postId, reason) => {
  const response = await apiClient.post('/reports', { postId, reason });
  return response.data;
};
