import apiClient from './client';

/**
 * Send a nudge to a user
 * @param {string} username - The recipient's username
 * @param {string} message - The nudge message (preset) or null if using customMessage
 * @param {string} customMessage - Optional custom message (max 100 chars)
 */
export const sendNudge = async (username, message, customMessage = null) => {
  try {
    const body = customMessage ? { customMessage } : { message };
    const response = await apiClient.post(`/nudges/${username}`, body);
    return response.data;
  } catch (error) {
    console.error('Failed to send nudge:', error);
    throw error;
  }
};

/**
 * Check if the current user can nudge another user
 * @param {number} userId - The recipient's user ID
 * @returns {Promise<{canNudge: boolean, reason?: string, hoursRemaining?: number}>}
 */
export const canNudgeUser = async (userId) => {
  try {
    const response = await apiClient.get(`/nudges/can-nudge/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to check nudge eligibility:', error);
    return { canNudge: false, reason: 'Error checking status' };
  }
};

export default function NudgesApiPage() {
  return null;
}
