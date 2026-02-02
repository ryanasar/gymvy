/**
 * Local Calendar Storage
 * Stores workout completion dates for the calendar view
 * Only stores simple completion status - not full workout data
 *
 * All functions require userId for user-specific storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { STORAGE_KEYS, getUserStorageKey } from './types';
import { getCalendarData as getBackendCalendarData, upsertDailyActivity } from '@/services/api/dailyActivity';
import { BACKEND_API_URL } from '@/constants/config';

const DAYS_TO_KEEP = 60; // Keep last 60 days of data

// Activity type priority for conflict resolution
// Higher priority wins when merging local and backend data
const ACTIVITY_PRIORITY = {
  'workout': 3,        // Highest - actual workout completed
  'planned_rest': 2,   // Scheduled rest day in split
  'unplanned_rest': 1, // User-initiated rest day
  'free_rest': 1,      // Weekly free rest day
};

/**
 * Get the user-specific calendar storage key
 * @param {string|number} userId
 * @returns {string}
 */
function getCalendarKey(userId) {
  return getUserStorageKey(STORAGE_KEYS.CALENDAR, userId);
}

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
 * Convert local calendar entry to activity type
 * @param {Object} localEntry - Local calendar entry
 * @returns {string|null} Activity type
 */
function getActivityType(localEntry) {
  if (!localEntry?.completed) return null;
  if (localEntry.isFreeRestDay) return 'free_rest';
  if (localEntry.isRestDay) return 'planned_rest';
  return 'workout';
}

/**
 * Convert backend DailyActivity format to local calendar format
 * @param {Object} backendEntry - Backend DailyActivity entry
 * @returns {Object} Local calendar format
 */
function backendToLocalFormat(backendEntry) {
  return {
    completed: true,
    isRestDay: backendEntry.activityType !== 'workout',
    isFreeRestDay: backendEntry.activityType === 'free_rest',
    timestamp: backendEntry.updatedAt || backendEntry.createdAt,
    activityType: backendEntry.activityType,
    workoutName: backendEntry.workoutName,
    muscleGroups: backendEntry.muscleGroups,
  };
}

/**
 * Get calendar data from local storage
 * Returns object with dates as keys, completion info as values
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>}
 */
export async function getCalendarData(userId) {
  try {
    const key = getCalendarKey(userId);
    const data = await AsyncStorage.getItem(key);
    if (!data) {
      return {};
    }

    const calendar = JSON.parse(data);

    // Clean up old entries (older than DAYS_TO_KEEP)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_KEEP);
    const cutoffString = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}-${String(cutoffDate.getDate()).padStart(2, '0')}`;

    const cleaned = {};
    Object.keys(calendar).forEach(dateStr => {
      if (dateStr >= cutoffString) {
        cleaned[dateStr] = calendar[dateStr];
      }
    });

    return cleaned;
  } catch (error) {
    console.error('[CalendarStorage] Error getting calendar data:', error);
    return {};
  }
}

/**
 * Save calendar data to local storage
 * @param {string|number} userId - User ID
 * @param {Object} calendar - Calendar data object
 * @returns {Promise<void>}
 */
async function saveCalendarData(userId, calendar) {
  try {
    const key = getCalendarKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify(calendar));
  } catch (error) {
    console.error('[CalendarStorage] Error saving calendar data:', error);
    throw error;
  }
}

/**
 * Mark today as completed (workout or rest day)
 * @param {string|number} userId - User ID
 * @param {boolean} isRestDay - Whether today is a rest day
 * @param {boolean} isFreeRestDay - Whether today is a free rest day
 * @param {Object} workoutDetails - Optional workout details for popup display
 * @param {string} workoutDetails.workoutName - Name of the workout
 * @param {Array} workoutDetails.muscleGroups - Array of muscle groups worked
 * @param {number} workoutDetails.totalExercises - Number of exercises
 * @param {number} workoutDetails.totalSets - Total number of sets
 * @param {number} workoutDetails.durationMinutes - Workout duration in minutes
 * @param {string} workoutDetails.splitEmoji - Emoji for the workout
 * @returns {Promise<void>}
 */
export async function markTodayCompleted(userId, isRestDay = false, isFreeRestDay = false, workoutDetails = null) {
  try {
    const calendar = await getCalendarData(userId);
    const today = getTodayDateString();

    calendar[today] = {
      completed: true,
      isRestDay: isRestDay,
      isFreeRestDay: isFreeRestDay,
      timestamp: new Date().toISOString(),
      // Include workout details if provided
      ...(workoutDetails && {
        workoutName: workoutDetails.workoutName || null,
        muscleGroups: workoutDetails.muscleGroups || [],
        totalExercises: workoutDetails.totalExercises || null,
        totalSets: workoutDetails.totalSets || null,
        durationMinutes: workoutDetails.durationMinutes || null,
        splitEmoji: workoutDetails.splitEmoji || null,
      }),
    };

    await saveCalendarData(userId, calendar);
  } catch (error) {
    console.error('[CalendarStorage] Error marking today as completed:', error);
    throw error;
  }
}

/**
 * Mark today as not completed (uncomplete)
 * Only today can be uncompleted - past dates are finalized
 * Deletes from both local storage and backend
 * @param {string|number} userId - User ID
 * @returns {Promise<void>}
 */
export async function unmarkTodayCompleted(userId) {
  try {
    const calendar = await getCalendarData(userId);
    const today = getTodayDateString();

    // Only allow unmarking today
    if (calendar[today]) {
      delete calendar[today];
      await saveCalendarData(userId, calendar);
    }

    // Also delete from backend
    try {
      await axios.delete(`${BACKEND_API_URL}/daily-activity/user/${userId}/date/${today}`);
      console.log('[CalendarStorage] Deleted dailyActivity from backend for:', today);
    } catch (backendError) {
      // 404 is fine - means nothing to delete
      if (backendError.response?.status !== 404) {
        console.warn('[CalendarStorage] Failed to delete from backend:', backendError.message);
      }
    }
  } catch (error) {
    console.error('[CalendarStorage] Error unmarking today as completed:', error);
    throw error;
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
 * @param {string|number} userId - User ID
 * @returns {Promise<Array>} Array of {date, volume, isRestDay, workoutName, muscleGroups, etc.}
 */
export async function getCalendarDataForDisplay(userId) {
  try {
    const calendar = await getCalendarData(userId);

    return Object.entries(calendar).map(([date, data]) => ({
      date,
      volume: data.isRestDay ? 0 : 1, // Just for display purposes
      isRestDay: data.isRestDay || false,
      isFreeRestDay: data.isFreeRestDay || false,
      // Workout details for popup
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
 * Used to populate historical data when first loaded or to sync
 * Does NOT overwrite today's data
 * @param {string|number} userId - User ID
 * @param {Array} workoutSessions - Array of workout session objects from backend
 * @returns {Promise<void>}
 */
export async function backfillCalendarFromBackend(userId, workoutSessions) {
  try {
    const calendar = await getCalendarData(userId);
    const today = getTodayDateString();

    workoutSessions.forEach(session => {
      if (session.completedAt) {
        // Use local date instead of UTC to match user's timezone
        const completedDate = new Date(session.completedAt);
        const date = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;

        // Don't overwrite today's data (it might be more recent)
        // Update existing entries if they're missing workout details
        const existingEntry = calendar[date];
        const needsUpdate = !existingEntry || !existingEntry.workoutName;
        if (date !== today && needsUpdate) {
          const isRestDay = session.type === 'rest_day' ||
                          (session.exercises?.length === 0 && session.dayName === 'Rest Day');

          // Calculate duration if we have start and end times
          let durationMinutes = null;
          if (session.startedAt && session.completedAt) {
            const start = new Date(session.startedAt);
            const end = new Date(session.completedAt);
            durationMinutes = Math.round((end - start) / (1000 * 60));
          }

          // Calculate total sets
          let totalSets = 0;
          if (session.exercises && Array.isArray(session.exercises)) {
            session.exercises.forEach(ex => {
              if (ex.sets && Array.isArray(ex.sets)) {
                totalSets += ex.sets.length;
              }
            });
          }

          // Get unique muscle groups
          const muscleGroups = [];
          if (session.exercises && Array.isArray(session.exercises)) {
            session.exercises.forEach(ex => {
              if (ex.primaryMuscle && !muscleGroups.includes(ex.primaryMuscle)) {
                muscleGroups.push(ex.primaryMuscle);
              }
            });
          }

          calendar[date] = {
            completed: true,
            isRestDay: isRestDay,
            timestamp: session.completedAt,
            // Workout details for popup
            workoutName: session.dayName || session.workoutName || null,
            muscleGroups: muscleGroups,
            totalExercises: session.exercises?.length || null,
            totalSets: totalSets || null,
            durationMinutes: durationMinutes,
            splitName: session.splitName || null,
            splitEmoji: session.splitEmoji || null,
          };
        }
      }
    });

    await saveCalendarData(userId, calendar);
  } catch (error) {
    console.error('[CalendarStorage] Error backfilling calendar:', error);
    throw error;
  }
}

/**
 * Bidirectional sync with DailyActivity backend
 * Uses priority-based conflict resolution:
 *   workout (3) > planned_rest (2) > unplanned_rest/free_rest (1)
 *
 * @param {string|number} userId - User ID
 * @returns {Promise<Object|null>} Merged calendar data, or null on failure
 */
export async function syncCalendarWithBackend(userId) {
  try {
    // 1. Get both data sources in parallel
    const [backendResponse, localCalendar] = await Promise.all([
      getBackendCalendarData(userId).catch(err => {
        console.warn('[CalendarStorage] Backend calendar fetch failed:', err.message);
        return { calendarMap: {} };
      }),
      getCalendarData(userId)
    ]);

    const backendMap = backendResponse.calendarMap || {};
    const merged = { ...localCalendar };

    // 2. Merge backend into local with priority resolution
    for (const [date, backendEntry] of Object.entries(backendMap)) {
      const localEntry = localCalendar[date];
      const backendPriority = ACTIVITY_PRIORITY[backendEntry.activityType] || 0;
      const localPriority = ACTIVITY_PRIORITY[getActivityType(localEntry)] || 0;

      // Backend wins if priority is >= local (or local doesn't exist)
      if (backendPriority >= localPriority) {
        merged[date] = backendToLocalFormat(backendEntry);
      }
      // else: keep local data (higher priority type)
    }

    // 3. Upload local-only entries to backend (bidirectional sync)
    // Skip today's date - it should only be synced when workout is completed via proper flow
    const today = getTodayDateString();
    const uploadPromises = [];
    for (const [date, localEntry] of Object.entries(localCalendar)) {
      // Only upload if:
      // - Not today (today is synced via workout completion flow)
      // - Not in backend yet
      // - Entry is completed
      // - Entry has higher priority than backend (or backend doesn't have it)
      if (date !== today && !backendMap[date] && localEntry.completed) {
        const activityType = getActivityType(localEntry);
        if (activityType) {
          uploadPromises.push(
            upsertDailyActivity(userId, date, {
              activityType: activityType,
              isPlanned: activityType === 'planned_rest',
              // Include workout details if available
              workoutName: localEntry.workoutName || null,
              muscleGroups: localEntry.muscleGroups || [],
              totalExercises: localEntry.totalExercises || null,
              totalSets: localEntry.totalSets || null,
              durationMinutes: localEntry.durationMinutes || null,
            }).catch(err => {
              console.warn('[CalendarStorage] Failed to upload activity:', date, err.message);
            })
          );
        }
      }
    }

    // Execute uploads in parallel (don't block on failures)
    if (uploadPromises.length > 0) {
      await Promise.allSettled(uploadPromises);
    }

    // 4. Save merged result locally
    await saveCalendarData(userId, merged);

    return merged;
  } catch (error) {
    console.error('[CalendarStorage] Calendar sync failed:', error);
    return null;
  }
}

/**
 * Clear all calendar data for a user (for testing/debugging)
 * @param {string|number} userId - User ID
 * @returns {Promise<void>}
 */
export async function clearCalendarData(userId) {
  try {
    const key = getCalendarKey(userId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('[CalendarStorage] Error clearing calendar data:', error);
    throw error;
  }
}
