import apiClient from './client';

export const getOrCreateUserBySupabaseId = async (supabaseId, email, name) => {
  try {
    const response = await apiClient.post(`/users/auth/${supabaseId}`, {
      email,
      ...(name && { name }),
    }, {
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserByUsername = async (username) => {
  try {
    const response = await apiClient.get(`/users/${username}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkUsernameAvailability = async (username, excludeUserId) => {
  if (!username.trim()) return false;

  const params = {};
  if (excludeUserId) params.excludeUserId = excludeUserId;

  const response = await apiClient.get(`/users/check-username/${username}`, { params });
  return response.data.available;
};

export const updateUserProfile = async (supabaseId, userData) => {
  try {
    const response = await apiClient.put(`/users/create-profile/${supabaseId}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const completeUserOnboarding = async (supabaseId) => {
  try {
    const response = await apiClient.put(`/users/complete-onboarding/${supabaseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await apiClient.get(`/profiles/user/${userId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getUserWorkoutPlans = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/workout-plans`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getUserPosts = async (userId) => {
  try {
    const response = await apiClient.get(`/posts/user/${userId}`);
    // Handle both paginated ({ posts, nextCursor, hasMore }) and legacy (array) responses
    const data = response.data;
    return Array.isArray(data) ? data : (data.posts || []);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
};

/**
 * Get suggested users for onboarding
 */
export const getSuggestedUsers = async (currentUserId) => {
  try {
    const response = await apiClient.get(`/users/suggested`, {
      params: { currentUserId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    return [];
  }
};

/**
 * Search users by username or name
 */
export const searchUsers = async (query, currentUserId) => {
  try {
    const params = { query };
    if (currentUserId) {
      params.currentUserId = currentUserId;
    }
    const response = await apiClient.get(`/users/search`, { params });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

/**
 * Follow a user
 */
export const followUser = async (username, followerId) => {
  try {
    const response = await apiClient.post(`/users/${username}/follow`, {
      followerId
    });
    return response.data;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (username, followerId) => {
  try {
    const response = await apiClient.delete(`/users/${username}/unfollow`, {
      data: { followerId }
    });
    return response.data;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

/**
 * Get followers list for a user
 */
export const getFollowers = async (username) => {
  try {
    const response = await apiClient.get(`/users/${username}/followers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
};

/**
 * Get following list for a user
 */
export const getFollowing = async (username) => {
  try {
    const response = await apiClient.get(`/users/${username}/following`);
    return response.data;
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
};

export default function UsersApiPage() {
  return null;
}
