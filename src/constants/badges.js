export const BADGE_TYPES = {
  STREAK: 'streak',
  SPLIT_COMPLETED: 'split_completed',
  NEW_1RM: 'new_1rm',
};

export const BADGE_CONFIG = {
  [BADGE_TYPES.STREAK]: {
    emoji: '\uD83D\uDD25',
    color: '#F59E0B',
    getLabel: (badge) => `\uD83D\uDD25 ${badge.value}-day streak`,
  },
  [BADGE_TYPES.SPLIT_COMPLETED]: {
    emoji: '\uD83C\uDF89',
    color: '#8B5CF6',
    getLabel: () => '\uD83C\uDF89 Split Completed',
  },
  [BADGE_TYPES.NEW_1RM]: {
    emoji: '\uD83C\uDFC6',
    color: '#EF4444',
    getLabel: (badge) => {
      const names = badge.exercises || [];
      if (names.length === 0) return '\uD83C\uDFC6 New PR';
      if (names.length === 1) return `\uD83C\uDFC6 ${names[0]} PR`;
      return `\uD83C\uDFC6 ${names.length} New PRs`;
    },
  },
};

/**
 * Build a badges array from individual badge inputs.
 * @param {Object} opts
 * @param {number} [opts.streak] - Current streak count
 * @param {boolean} [opts.isSplitCompleted] - Whether split was just completed
 * @param {string[]} [opts.prExercises] - Exercise names with new PRs
 * @returns {Object[]|null} Badges array or null if empty
 */
export function buildBadges({ streak, isSplitCompleted, prExercises } = {}) {
  const badges = [];

  if (streak && streak > 1) {
    badges.push({ type: BADGE_TYPES.STREAK, value: streak });
  }

  if (isSplitCompleted) {
    badges.push({ type: BADGE_TYPES.SPLIT_COMPLETED });
  }

  if (prExercises && prExercises.length > 0) {
    badges.push({ type: BADGE_TYPES.NEW_1RM, exercises: prExercises });
  }

  return badges.length > 0 ? badges : null;
}
