import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage, getUserStorageKey, STORAGE_KEYS } from '@/services/storage';

/**
 * Clear the active split from local storage for a specific user
 * Useful when there's a mismatch between local and backend
 * @param {string|number} userId - User ID to clear split for
 */
export async function clearLocalSplit(userId) {
  try {
    if (userId) {
      const splitKey = getUserStorageKey(STORAGE_KEYS.ACTIVE_SPLIT, userId);
      await AsyncStorage.removeItem(splitKey);
    }
    await AsyncStorage.removeItem('currentWeek');
    await AsyncStorage.removeItem('currentDayIndex');
    await AsyncStorage.removeItem('lastCompletionDate');
    await AsyncStorage.removeItem('lastCheckDate');

    return true;
  } catch (error) {
    console.error('[ClearLocalSplit] Error clearing local split:', error);
    return false;
  }
}

/**
 * Force reload split from backend and save to local storage
 * Use this when local split data is corrupted
 */
export async function reloadSplitFromBackend(splitId, userId) {
  try {
    const { getSplitsByUserId } = await import('@/services/api/splits');

    const splits = await getSplitsByUserId(userId);
    const split = splits.find(s => s.id === splitId);

    if (!split) {
      console.error('[ReloadSplit] Split not found on backend:', splitId);
      return null;
    }

    const localSplit = {
      id: split.id,
      name: split.name,
      emoji: split.emoji,
      description: split.description,
      totalDays: split.numDays || split.totalDays,
      isPublic: split.isPublic,
      days: split.workoutDays.map((day, index) => ({
        dayIndex: index,
        name: day.workoutName,
        type: day.workoutType,
        emoji: day.emoji,
        isRest: day.isRest || false,
        exercises: (day.exercises || [])
          .map(ex => {
            const exerciseId = ex.exerciseId?.toString() || ex.id?.toString();
            const targetSets = parseInt(ex.targetSets || ex.sets) || 3;
            const targetReps = parseInt(ex.targetReps || ex.reps) || 10;
            const restSeconds = parseInt(ex.restSeconds) || 0;

            if (!exerciseId || exerciseId === 'undefined') {
              return null;
            }

            return {
              exerciseId,
              targetSets,
              targetReps,
              restSeconds,
            };
          })
          .filter(ex => ex !== null),
      })),
    };

    await storage.saveSplit(userId, localSplit);

    return localSplit;
  } catch (error) {
    console.error('[ReloadSplit] Error reloading split:', error);
    return null;
  }
}
