import apiClient from './client';

/**
 * Get pending follow requests for current user
 */
export const getPendingFollowRequests = async () => {
  try {
    const response = await apiClient.get(`/follow-requests/pending`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending follow requests:', error);
    throw error;
  }
};

/**
 * Accept a follow request
 */
export const acceptFollowRequest = async (requestId) => {
  try {
    const response = await apiClient.post(`/follow-requests/${requestId}/accept`);
    return response.data;
  } catch (error) {
    console.error('Error accepting follow request:', error);
    throw error;
  }
};

/**
 * Reject a follow request
 */
export const rejectFollowRequest = async (requestId) => {
  try {
    const response = await apiClient.post(`/follow-requests/${requestId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting follow request:', error);
    throw error;
  }
};

/**
 * Cancel a sent follow request by request ID
 */
export const cancelFollowRequest = async (requestId) => {
  try {
    const response = await apiClient.delete(`/follow-requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling follow request:', error);
    throw error;
  }
};

/**
 * Cancel a sent follow request by target user ID
 */
export const cancelFollowRequestByTargetId = async (targetId) => {
  try {
    const response = await apiClient.delete(`/follow-requests/by-target/${targetId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling follow request:', error);
    throw error;
  }
};

export default function FollowRequestsApiPage() {
  return null;
}
