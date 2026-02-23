import { getCalendarData } from '@/services/storage/calendarStorage';
import { upsertDailyActivity } from '@/services/api/dailyActivity';

/**
 * Format a Date as YYYY-MM-DD in local timezone
 */
function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a user's streak has broken and is eligible for restore
 *
 * Returns null if no restore is available (streak < 5, no break, already restored, past deadline)
 * Returns { lostStreak, missedDate } if a restore is available
 *
 * @param {string|number} userId
 * @returns {Promise<Object|null>}
 */
export async function checkStreakBreak(userId) {
  try {
    const calendarData = await getCalendarData(userId);

    if (!calendarData || Object.keys(calendarData).length === 0) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatLocalDate(today);

    // If there's already an activity today, no break to restore
    if (calendarData[todayStr]) {
      return null;
    }

    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterday);

    // Sort all activity dates descending
    const sortedDates = Object.keys(calendarData)
      .filter(dateStr => calendarData[dateStr].activityType)
      .sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) {
      return null;
    }

    const mostRecentDate = sortedDates[0];
    const mostRecentDateObj = new Date(mostRecentDate);
    mostRecentDateObj.setHours(0, 0, 0, 0);

    // Only trigger for missed workout days — missing a day after a rest day
    // doesn't break the streak since the user was already resting.
    const mostRecentActivity = calendarData[mostRecentDate];
    if (mostRecentActivity.activityType !== 'workout') {
      return null;
    }

    // Calculate gap: how many days since most recent activity?
    // Scenario: User works out Mon-Wed. Skips Thursday.
    // On Friday: daysSinceMostRecent = 2 (Wed → Fri). Yesterday (Thu) was missed.
    // We need daysSinceMostRecent === 2 for a restorable break.
    const daysSinceMostRecent = Math.floor((today - mostRecentDateObj) / (1000 * 60 * 60 * 24));

    if (daysSinceMostRecent !== 2) {
      // 0 = active today, 1 = streak hasn't broken yet, 3+ = broke too long ago
      return null;
    }

    // Yesterday is the missed date (the day between most recent activity and today)
    const missedDate = yesterdayStr;

    // Make sure yesterday doesn't already have an activity (shouldn't, but safety check)
    if (calendarData[yesterdayStr]) {
      return null;
    }

    // Calculate what the streak was before the break
    // Count consecutive workout days backwards from mostRecentDate
    let streakCount = 0;
    let checkDate = new Date(mostRecentDateObj);

    while (true) {
      const checkDateStr = formatLocalDate(checkDate);
      const activity = calendarData[checkDateStr];

      if (!activity || !activity.activityType) {
        break;
      }

      if (activity.activityType === 'workout') {
        streakCount++;
      }

      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1);

      // Check if the previous day also has activity (no gap)
      const prevDateStr = formatLocalDate(checkDate);
      if (!calendarData[prevDateStr]) {
        break;
      }
    }

    // Minimum 5-day streak to unlock restore
    if (streakCount < 5) {
      return null;
    }

    return {
      lostStreak: streakCount,
      missedDate,
    };
  } catch (error) {
    console.error('[StreakRestore] Error checking streak break:', error);
    return null;
  }
}

/**
 * Restore a streak by inserting an unplanned_rest for the missed date
 *
 * @param {string|number} userId
 * @param {string} missedDate - YYYY-MM-DD format
 * @returns {Promise<boolean>} true if successful
 */
export async function restoreStreak(userId, missedDate) {
  try {
    await upsertDailyActivity(userId, missedDate, {
      activityType: 'unplanned_rest',
      isPlanned: false,
      restReason: 'streak_restore',
    });

    return true;
  } catch (error) {
    console.error('[StreakRestore] Error restoring streak:', error);
    return false;
  }
}
