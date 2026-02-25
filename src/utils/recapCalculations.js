import { calculateStreakFromLocal } from '@/services/storage/workoutHelpers';

/**
 * Calculates monthly recap data from workout sessions
 * @param {Array} workoutSessions - Backend workout sessions (with flat sets array)
 * @param {number} month - 1-indexed month (1=Jan, 2=Feb, etc.)
 * @param {number} year - Full year (e.g. 2026)
 * @param {string|number} userId - User ID for streak calculation
 * @returns {Object} recap data shaped for MonthlyRecapTemplate
 */
export async function calculateMonthlyRecap(workoutSessions, month, year, userId) {
  const sessions = (workoutSessions || []).filter(s => {
    if (!s.completedAt) return false;
    const d = new Date(s.completedAt);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const totalWorkouts = sessions.length;

  // Total volume: sum of weight × reps across all sets
  let totalVolume = 0;
  for (const session of sessions) {
    for (const set of session.sets || []) {
      if (set.weight && set.reps) {
        totalVolume += set.weight * set.reps;
      }
    }
  }

  // Total duration in minutes from startedAt to completedAt
  let totalDuration = 0;
  for (const session of sessions) {
    if (session.startedAt && session.completedAt) {
      const start = new Date(session.startedAt).getTime();
      const end = new Date(session.completedAt).getTime();
      const mins = Math.round((end - start) / 60000);
      if (mins > 0 && mins < 600) { // sanity check: under 10 hours
        totalDuration += mins;
      }
    }
  }

  // Current streak
  let currentStreak = 0;
  if (userId) {
    try {
      currentStreak = await calculateStreakFromLocal(userId);
    } catch {
      currentStreak = 0;
    }
  }

  // Top exercises: group sets by exerciseName, count sets, sort desc
  const exerciseSetCounts = {};
  for (const session of sessions) {
    for (const set of session.sets || []) {
      if (set.exerciseName) {
        exerciseSetCounts[set.exerciseName] = (exerciseSetCounts[set.exerciseName] || 0) + 1;
      }
    }
  }

  const topExercises = Object.entries(exerciseSetCounts)
    .map(([name, sets]) => ({ name, sets }))
    .sort((a, b) => b.sets - a.sets)
    .slice(0, 3);

  const topExercise = topExercises.length > 0 ? topExercises[0] : null;

  // Month label
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthLabel = `${monthNames[month - 1]} ${year}`;

  return {
    totalWorkouts,
    totalVolume,
    totalDuration,
    currentStreak,
    topExercises,
    topExercise,
    month: monthLabel,
  };
}
