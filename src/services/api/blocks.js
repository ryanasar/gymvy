import apiClient from './client';

export const blockUser = async (blockedId) => {
  const response = await apiClient.post('/blocks', { blockedId });
  return response.data;
};

export const unblockUser = async (blockedId) => {
  const response = await apiClient.delete(`/blocks/${blockedId}`);
  return response.data;
};

export const getBlockedUsers = async () => {
  const response = await apiClient.get('/blocks');
  return response.data;
};
