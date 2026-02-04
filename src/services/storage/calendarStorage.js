/**
 * Calendar Storage - Backend-only
 * Calendar data is fetched from backend DailyActivity table.
 * No local AsyncStorage caching.
 */

import { getCalendarData as getBackendCalendarData, deleteDailyActivityByDate } from '@/services/api/dailyActivity';
import { checkNetworkStatus } from '@/services/network/networkService';

/**
 * Get today's date string in YYYY-MM-DD format (local timezone)
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get calendar data from backend
 * Returns object with dates as keys, completion info as values
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>}
 */
export async function getCalendarData(userId) {
  try {
    const isOnline = await checkNetworkStatus();
    if (!isOnline) {
      console.warn('[CalendarStorage] Offline - returning empty calendar');
      return {};
    }

    const response = await getBackendCalendarData(userId);
    return response.calendarMap || {};
  } catch (error) {
    console.error('[CalendarStorage] Error getting calendar data:', error);
    return {};
  }
}

/**
 * Mark today as completed (workout or rest day)
 * NOTE: For workouts, this is handled automatically when WorkoutSession is created.
 * This function is now only used for rest days.
 * @param {string|number} userId - User ID
 * @param {boolean} isRestDay - Whether today is a rest day
 * @param {boolean} isFreeRestDay - Whether today is a free rest day
 * @param {Object} workoutDetails - Optional workout details (unused for rest days)
 * @returns {Promise<void>}
 */
export async function markTodayCompleted(userId, isRestDay = false, isFreeRestDay = false, workoutDetails = null) {
  // For workouts, DailyActivity is created by backend when WorkoutSession is created.
  // This function is a no-op for workouts.
  // Rest days should be handled by the rest day flow which calls the backend directly.
  if (!isRestDay && !isFreeRestDay) {
    console.log('[CalendarStorage] markTodayCompleted: workouts are handled by WorkoutSession creation');
    return;
  }

  // For rest days, the caller should use the backend API directly
  console.log('[CalendarStorage] markTodayCompleted: rest days should use backend API directly');
}

/**
 * Mark today as not completed (uncomplete)
 * Deletes DailyActivity from backend
 * @param {string|number} userId - User ID
 * @returns {Promise<void>}
 */
export async function unmarkTodayCompleted(userId) {
  try {
    const today = getTodayDateString();

    const isOnline = await checkNetworkStatus();
    if (!isOnline) {
      throw new Error('Uncompleting requires an internet connection');
    }

    await deleteDailyActivityByDate(userId, today);
    console.log('[CalendarStorage] Deleted dailyActivity from backend for:', today);
  } catch (error) {
    // deleteDailyActivityByDate already handles 404
    if (error.response?.status !== 404) {
      console.error('[CalendarStorage] Error unmarking today as completed:', error);
      throw error;
    }
  }
}

/**
 * Check if today is marked as completed
 * @param {string|number} userId - User ID
 * @returns {Promise<boolean>}
 */
export async function isTodayCompleted(userId) {
  try {
    const calendar = await getCalendarData(userId);
    const today = getTodayDateString();
    return !!calendar[today];
  } catch (error) {
    console.error('[CalendarStorage] Error checking if today is completed:', error);
    return false;
  }
}

/**
 * Get calendar data in the format expected by WorkoutCalendar component
 * Fetches from backend and transforms for UI
 * @param {string|number} userId - User ID
 * @returns {Promise<Array>} Array of {date, volume, isRestDay, workoutName, muscleGroups, workoutSessionId, etc.}
 */
export async function getCalendarDataForDisplay(userId) {
  try {
    const isOnline = await checkNetworkStatus();
    if (!isOnline) {
      console.warn('[CalendarStorage] Offline - returning empty calendar for display');
      return [];
    }

    const response = await getBackendCalendarData(userId);
    const calendarMap = response.calendarMap || {};

    return Object.entries(calendarMap).map(([date, data]) => ({
      date,
      volume: data.activityType === 'workout' ? 1 : 0,
      isRestDay: data.activityType !== 'workout',
      isFreeRestDay: data.activityType === 'free_rest',
      // Include workoutSessionId for fetching full details
      workoutSessionId: data.workoutSessionId || null,
      // Workout details from DailyActivity
      workoutName: data.workoutName || null,
      muscleGroups: data.muscleGroups || [],
      totalExercises: data.totalExercises || null,
      totalSets: data.totalSets || null,
      durationMinutes: data.durationMinutes || null,
      splitName: data.splitName || null,
      splitEmoji: data.splitEmoji || null,
    }));
  } catch (error) {
    console.error('[CalendarStorage] Error getting calendar data for display:', error);
    return [];
  }
}

/**
 * Backfill calendar data from backend workout sessions
 * @deprecated No longer needed - calendar is backend-only
 */
export async function backfillCalendarFromBackend() {
  console.warn('[CalendarStorage] backfillCalendarFromBackend is deprecated - calendar is backend-only');
}

/**
 * Bidirectional sync with DailyActivity backend
 * @deprecated No longer needed - calendar is backend-only
 */
export async function syncCalendarWithBackend() {
  console.warn('[CalendarStorage] syncCalendarWithBackend is deprecated - calendar is backend-only');
  return null;
}

/**
 * Clear all calendar data for a user
 * @deprecated No local storage to clear - calendar is backend-only
 */
export async function clearCalendarData() {
  console.warn('[CalendarStorage] clearCalendarData is deprecated - calendar is backend-only');
}
