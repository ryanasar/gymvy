import apiClient from './client';

export const createCommunity = async (data) => {
  try {
    const response = await apiClient.post('/communities', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create community:', error);
    throw error;
  }
};

export const getCommunityById = async (id) => {
  try {
    const response = await apiClient.get(`/communities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get community:', error);
    throw error;
  }
};

export const updateCommunity = async (id, data) => {
  try {
    const response = await apiClient.put(`/communities/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update community:', error);
    throw error;
  }
};

export const deleteCommunity = async (id) => {
  try {
    const response = await apiClient.delete(`/communities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete community:', error);
    throw error;
  }
};

export const joinCommunityByCode = async (inviteCode) => {
  try {
    const response = await apiClient.post('/communities/join', { inviteCode: inviteCode.toUpperCase() });
    return response.data;
  } catch (error) {
    console.error('Failed to join community:', error);
    throw error;
  }
};

export const leaveCommunity = async (id) => {
  try {
    const response = await apiClient.post(`/communities/${id}/leave`);
    return response.data;
  } catch (error) {
    console.error('Failed to leave community:', error);
    throw error;
  }
};

export const getCommunityMembers = async (id) => {
  try {
    const response = await apiClient.get(`/communities/${id}/members`);
    return response.data;
  } catch (error) {
    console.error('Failed to get community members:', error);
    throw error;
  }
};

export const updateMemberRole = async (id, userId, role) => {
  try {
    const response = await apiClient.put(`/communities/${id}/members/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Failed to update member role:', error);
    throw error;
  }
};

export const removeMember = async (id, userId) => {
  try {
    const response = await apiClient.delete(`/communities/${id}/members/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to remove member:', error);
    throw error;
  }
};

export const regenerateInviteCode = async (id) => {
  try {
    const response = await apiClient.post(`/communities/${id}/regenerate-invite`);
    return response.data;
  } catch (error) {
    console.error('Failed to regenerate invite code:', error);
    throw error;
  }
};

export const getCommunitiesByUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/communities/by-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get communities by user:', error);
    throw error;
  }
};

export const searchCommunities = async (query) => {
  try {
    const response = await apiClient.get(`/communities/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to search communities:', error);
    throw error;
  }
};

export const getCommunityFeed = async (id, cursor, limit = 10) => {
  try {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    const response = await apiClient.get(`/communities/${id}/feed`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to get community feed:', error);
    throw error;
  }
};

export default function CommunitiesApiPage() {
  return null;
}
