/**
 * Body Weight Local Storage
 * Stores body weight entries for the progress charts
 *
 * All functions require userId for user-specific storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, getUserStorageKey } from './types';

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
 * Get the user-specific body weight storage key
 * @param {string|number} userId
 * @returns {string}
 */
function getBodyWeightKey(userId) {
  return getUserStorageKey(STORAGE_KEYS.BODY_WEIGHT_LOG, userId);
}

/**
 * Get all body weight entries, sorted by date ascending
 * @param {string|number} userId - User ID
 * @returns {Promise<Array<{date: string, weight: number, timestamp: string}>>}
 */
export async function getBodyWeightLog(userId) {
  try {
    const key = getBodyWeightKey(userId);
    const data = await AsyncStorage.getItem(key);
    if (!data) return [];

    const entries = JSON.parse(data);
    return entries.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('[BodyWeightStorage] Error getting body weight log:', error);
    return [];
  }
}

/**
 * Add or update a body weight entry for today
 * @param {string|number} userId - User ID
 * @param {number} weight - Weight in lbs
 * @returns {Promise<void>}
 */
export async function addBodyWeightEntry(userId, weight) {
  try {
    const entries = await getBodyWeightLog(userId);
    const today = getTodayDateString();

    const existingIndex = entries.findIndex(e => e.date === today);
    const entry = { date: today, weight, timestamp: new Date().toISOString() };

    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    const key = getBodyWeightKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify(entries));
  } catch (error) {
    console.error('[BodyWeightStorage] Error adding body weight entry:', error);
    throw error;
  }
}

/**
 * Clear all body weight data for a user
 * @param {string|number} userId - User ID
 * @returns {Promise<void>}
 */
export async function clearBodyWeightLog(userId) {
  try {
    const key = getBodyWeightKey(userId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('[BodyWeightStorage] Error clearing body weight log:', error);
    throw error;
  }
}
