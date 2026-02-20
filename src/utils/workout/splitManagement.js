import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage, unmarkTodayCompleted } from '@/services/storage';
import { updateSplit, syncSplitProgress } from "@/services/api/splits";
import { markRestDay } from '@/services/api/dailyActivity';

export const handleDaySelection = async (userId, dayIndex, activeSplit, markWorkoutCompleted, refreshTodaysWorkout) => {
  try {
    // Clear any existing completion for today when changing days
    await unmarkTodayCompleted(userId);

    // Clear completion state but preserve lastCheckDate so advancement works tomorrow
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    await AsyncStorage.multiRemove(['completedSessionId', 'lastCompletionDate']);
    await AsyncStorage.setItem('lastCheckDate', todayStr);

    // Clear completion in context
    await markWorkoutCompleted(null);

    // Update the split to mark it as started in backend
    if (activeSplit?.id) {
      await updateSplit(activeSplit.id, { started: true });

      // Update the local split object with started: true
      const updatedSplit = { ...activeSplit, started: true };
      await storage.saveSplit(userId, updatedSplit);
    }

    // Update local storage to set current day
    await AsyncStorage.setItem('currentDayIndex', dayIndex.toString());

    // Only reset cycle when starting a split for the first time
    // If split is already started, preserve the current cycle
    let weekValue;
    if (!activeSplit?.started) {
      await AsyncStorage.setItem('currentWeek', '1');
      weekValue = 1;
    } else {
      const savedWeek = await AsyncStorage.getItem('currentWeek');
      weekValue = savedWeek ? parseInt(savedWeek) : 1;
    }

    // Sync progress to backend (fire-and-forget)
    if (activeSplit?.id) {
      syncSplitProgress(activeSplit.id, {
        currentDayIndex: dayIndex,
        currentWeek: weekValue,
        lastAdvancementDate: todayStr,
      });
    }

    // Check if selected day is a rest day and sync to backend
    const days = activeSplit?.days || activeSplit?.workoutDays || [];
    const selectedDay = days[dayIndex];
    if (selectedDay?.isRest) {
      try {
        await markRestDay(userId, todayStr, {
          activityType: 'planned_rest',
          isPlanned: true,
          splitId: activeSplit?.id || null,
          dayNumber: dayIndex + 1,
          plannedWorkoutName: selectedDay.name || selectedDay.dayName || 'Rest Day',
        });
      } catch {
        // Silent fail - rest day sync is non-critical
      }
    }

    // Refresh to show the selected workout
    await refreshTodaysWorkout();
  } catch (error) {
    console.error('[Split Management] Error starting split:', error);
    Alert.alert('Error', 'Failed to start split. Please try again.');
    throw error;
  }
};

export const clearLocalSplitData = async (userId, refreshTodaysWorkout) => {
  return new Promise((resolve) => {
    Alert.alert(
      'Clear Local Data?',
      'This will remove the local split and reset your progress. You can then select a new split from the Program tab.\n\nYour workout history is safe.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const { clearLocalSplit } = await import('@/utils/clearLocalSplit');
            const success = await clearLocalSplit(userId);
            if (success) {
              Alert.alert('Cleared!', 'Local split data has been cleared. Pull to refresh or restart the app.', [
                {
                  text: 'Refresh Now',
                  onPress: async () => {
                    await refreshTodaysWorkout();
                  },
                },
              ]);
              resolve(true);
            } else {
              Alert.alert('Error', 'Failed to clear local data.');
              resolve(false);
            }
          },
        },
      ]
    );
  });
};
