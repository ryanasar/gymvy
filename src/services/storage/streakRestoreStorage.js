import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, getUserStorageKey } from './types';

/**
 * Get the streak restore data for a user
 * @param {string|number} userId
 * @returns {Promise<Object>} { hasFreeRestore: boolean, restoreCount: number }
 */
async function getStreakRestoreData(userId) {
  try {
    const key = getUserStorageKey(STORAGE_KEYS.STREAK_RESTORE, userId);
    const data = await AsyncStorage.getItem(key);
    if (!data) {
      return { hasFreeRestore: true, restoreCount: 0 };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('[StreakRestore] Error reading streak restore data:', error);
    return { hasFreeRestore: true, restoreCount: 0 };
  }
}

/**
 * Save streak restore data for a user
 * @param {string|number} userId
 * @param {Object} data
 */
async function saveStreakRestoreData(userId, data) {
  try {
    const key = getUserStorageKey(STORAGE_KEYS.STREAK_RESTORE, userId);
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('[StreakRestore] Error saving streak restore data:', error);
  }
}

/**
 * Check if user has a free restore available
 * @param {string|number} userId
 * @returns {Promise<boolean>}
 */
export async function hasFreeRestore(userId) {
  const data = await getStreakRestoreData(userId);
  return data.hasFreeRestore;
}

/**
 * Use the one-time free restore
 * @param {string|number} userId
 */
export async function useFreeRestore(userId) {
  const data = await getStreakRestoreData(userId);
  data.hasFreeRestore = false;
  data.restoreCount = (data.restoreCount || 0) + 1;
  await saveStreakRestoreData(userId, data);
}

/**
 * Get total restore count for analytics
 * @param {string|number} userId
 * @returns {Promise<number>}
 */
export async function getRestoreCount(userId) {
  const data = await getStreakRestoreData(userId);
  return data.restoreCount || 0;
}

/**
 * Increment restore count (for paid restores)
 * @param {string|number} userId
 */
export async function incrementRestoreCount(userId) {
  const data = await getStreakRestoreData(userId);
  data.restoreCount = (data.restoreCount || 0) + 1;
  await saveStreakRestoreData(userId, data);
}
