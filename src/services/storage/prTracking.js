import AsyncStorage from '@react-native-async-storage/async-storage';
import { getExercisePRs } from '../api/workoutSessions';

const PR_STORE_KEY = (userId) => `exercise_prs:${userId}`;

export const getLocalPRStore = async (userId) => {
  try {
    const data = await AsyncStorage.getItem(PR_STORE_KEY(userId));
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('[PRTracking] Failed to get local PR store:', error);
    return {};
  }
};

export const saveLocalPRStore = async (userId, store) => {
  try {
    await AsyncStorage.setItem(PR_STORE_KEY(userId), JSON.stringify(store));
  } catch (error) {
    console.error('[PRTracking] Failed to save local PR store:', error);
  }
};

export const detectPRs = (exercises, localPRStore) => {
  const newPRs = [];
  const updatedStore = { ...localPRStore };

  for (const exercise of exercises) {
    if (exercise.exerciseType === 'cardio') continue;

    const sets = exercise.sessionSets;
    if (!sets || !Array.isArray(sets)) continue;

    let bestE1RM = 0;
    for (const set of sets) {
      if (!set.completed) continue;
      const weight = parseFloat(set.weight);
      const reps = parseInt(set.reps);
      if (!weight || weight <= 0 || !reps || reps <= 0) continue;

      const e1rm = weight * (1 + reps / 30);
      const rounded = Math.round(e1rm / 5) * 5;
      if (rounded > bestE1RM) {
        bestE1RM = rounded;
      }
    }

    if (bestE1RM <= 0) continue;

    const name = exercise.name;
    const existing = updatedStore[name];

    if (!existing) {
      // First time doing this exercise — record it, NOT a PR
      updatedStore[name] = { bestE1RM };
    } else if (bestE1RM > existing.bestE1RM) {
      // New PR!
      updatedStore[name] = { bestE1RM };
      newPRs.push(name);
    }
  }

  return { newPRs, updatedStore };
};

export const fetchAndSeedPRs = async (userId) => {
  const localStore = await getLocalPRStore(userId);
  if (Object.keys(localStore).length > 0) return;

  try {
    const prs = await getExercisePRs(userId);
    if (prs && prs.length > 0) {
      const store = {};
      for (const pr of prs) {
        store[pr.exerciseName] = { bestE1RM: pr.bestE1RM };
      }
      await saveLocalPRStore(userId, store);
    }
  } catch (error) {
    console.error('[PRTracking] Failed to fetch and seed PRs:', error);
  }
};
