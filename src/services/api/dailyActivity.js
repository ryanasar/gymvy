import apiClient from './client';

/**
 * Get daily activities for a user with optional date range
 * @param {number} userId
 * @param {string} startDate - YYYY-MM-DD format (optional)
 * @param {string} endDate - YYYY-MM-DD format (optional)
 * @returns {Promise<Array>}
 */
export const getDailyActivitiesByUserId = async (userId, startDate, endDate) => {
  try {
    let url = `/daily-activity/user/${userId}`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch daily activities:', error);
    throw error;
  }
};

/**
 * Get today's activity for a user (or specific date)
 * @param {number} userId
 * @param {string} date - YYYY-MM-DD format (optional, defaults to today)
 * @returns {Promise<Object|null>}
 */
export const getTodaysActivity = async (userId, date) => {
  try {
    let url = `/daily-activity/user/${userId}/today`;
    if (date) url += `?date=${date}`;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    // 404 means no activity found, which is normal
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Failed to fetch today\'s activity:', error);
    throw error;
  }
};

/**
 * Get calendar data for a user (optimized for UI display)
 * @param {number} userId
 * @param {Object} options - { startDate, endDate } or { month, year }
 * @returns {Promise<Object>} - { activities, calendarMap, dateRange }
 */
export const getCalendarData = async (userId, options = {}) => {
  try {
    let url = `/daily-activity/user/${userId}/calendar`;
    const params = new URLSearchParams();

    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.month) params.append('month', options.month);
    if (options.year) params.append('year', options.year);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch calendar data:', error);
    throw error;
  }
};

/**
 * Create a new daily activity
 * @param {Object} activityData
 * @returns {Promise<Object>}
 */
export const createDailyActivity = async (activityData) => {
  try {
    const response = await apiClient.post('/daily-activity', activityData);
    return response.data;
  } catch (error) {
    console.error('Failed to create daily activity:', error);
    throw error;
  }
};

/**
 * Update a daily activity by ID
 * @param {number} id
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export const updateDailyActivity = async (id, updates) => {
  try {
    const response = await apiClient.put(`/daily-activity/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Failed to update daily activity:', error);
    throw error;
  }
};

/**
 * Upsert daily activity by user and date (most common use case)
 * @param {number} userId
 * @param {string} date - YYYY-MM-DD format
 * @param {Object} activityData
 * @returns {Promise<Object>}
 */
export const upsertDailyActivity = async (userId, date, activityData) => {
  try {
    const response = await apiClient.put(`/daily-activity/user/${userId}/date/${date}`, activityData);
    return response.data;
  } catch (error) {
    console.error('Failed to upsert daily activity:', error);
    throw error;
  }
};

/**
 * Delete a daily activity by ID
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const deleteDailyActivity = async (id) => {
  try {
    const response = await apiClient.delete(`/daily-activity/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete daily activity:', error);
    throw error;
  }
};

/**
 * Delete a daily activity by user and date
 * @param {number} userId
 * @param {string} date - YYYY-MM-DD format
 * @returns {Promise<Object>}
 */
export const deleteDailyActivityByDate = async (userId, date) => {
  try {
    const response = await apiClient.delete(`/daily-activity/user/${userId}/date/${date}`);
    return response.data;
  } catch (error) {
    // 404 means no activity found, which is fine when uncompleting
    if (error.response?.status === 404) {
      return { message: 'No activity found for this date' };
    }
    console.error('Failed to delete daily activity by date:', error);
    throw error;
  }
};

/**
 * Mark a rest day for a user
 * @param {number} userId
 * @param {string} date - YYYY-MM-DD format
 * @param {Object} restData - { activityType, restReason, recoveryActivities, splitId, plannedWorkoutName, etc. }
 * @returns {Promise<Object>}
 */
export const markRestDay = async (userId, date, restData = {}) => {
  return upsertDailyActivity(userId, date, {
    activityType: restData.activityType || 'planned_rest',
    isPlanned: restData.isPlanned ?? true,
    restReason: restData.restReason,
    recoveryActivities: restData.recoveryActivities || [],
    splitId: restData.splitId,
    plannedDayIndex: restData.plannedDayIndex,
    plannedWorkoutName: restData.plannedWorkoutName,
    weekNumber: restData.weekNumber,
    dayNumber: restData.dayNumber,
  });
};

/**
 * Convert a workout day to a rest day (when user decides not to workout)
 * @param {number} userId
 * @param {string} date - YYYY-MM-DD format
 * @param {Object} data - { restReason, plannedWorkoutName, splitId, etc. }
 * @returns {Promise<Object>}
 */
export const convertToRestDay = async (userId, date, data = {}) => {
  return upsertDailyActivity(userId, date, {
    activityType: 'unplanned_rest',
    isPlanned: false,
    restReason: data.restReason,
    recoveryActivities: data.recoveryActivities || [],
    splitId: data.splitId,
    plannedDayIndex: data.plannedDayIndex,
    plannedWorkoutName: data.plannedWorkoutName,
    weekNumber: data.weekNumber,
    dayNumber: data.dayNumber,
    // Clear workout fields
    workoutSessionId: null,
    workoutName: null,
    muscleGroups: [],
    totalExercises: null,
    totalSets: null,
    durationMinutes: null,
  });
};

/**
 * Mark a free rest day (weekly free rest that doesn't affect split progress)
 * @param {number} userId
 * @param {string} date - YYYY-MM-DD format
 * @param {Object} data - optional data like restReason, recoveryActivities
 * @returns {Promise<Object>}
 */
export const markFreeRestDay = async (userId, date, data = {}) => {
  return upsertDailyActivity(userId, date, {
    activityType: 'free_rest',
    isPlanned: true,
    restReason: data.restReason,
    recoveryActivities: data.recoveryActivities || [],
    splitId: data.splitId,
  });
};

export default function DailyActivityApiPage() {
  return null;
}
