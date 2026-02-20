import { useState } from 'react';
import { Alert } from 'react-native';
import { storage } from '@/services/storage';
import { syncPendingWorkouts } from '@/services/storage/syncService';
import { getLocalPRStore, saveLocalPRStore } from '@/services/storage/prTracking';

export const useWorkoutCompletion = ({
  userId,
  markWorkoutCompleted,
  updatePendingCount,
  todaysWorkout,
  activeSplit,
  isRestDay,
  completedSessionId
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleCompletion = async (isCompleted) => {
    if (isToggling) return;

    if (isCompleted) {
      // Un-complete workflow - alert is shown by the calling component
      try {
        setIsToggling(true);

        if (completedSessionId) {
          const databaseId = await storage.getWorkoutDatabaseId(userId, completedSessionId);

          if (databaseId) {
            try {
              const { deleteWorkoutSession } = require('@/services/api/workoutSessions');
              const result = await deleteWorkoutSession(databaseId);
              console.log('[Workout Completion] Deleted workout from backend:', databaseId);

              // Update local PR store with recalculated PRs
              if (result?.updatedPRs && userId) {
                const prStore = await getLocalPRStore(userId);
                for (const [exercise, value] of Object.entries(result.updatedPRs)) {
                  if (value === null) {
                    delete prStore[exercise];
                  } else {
                    prStore[exercise] = { bestE1RM: value };
                  }
                }
                await saveLocalPRStore(userId, prStore);
              }
            } catch (error) {
              if (error.response?.status !== 404) {
                console.error('[Workout Completion] Error deleting workout from backend:', error);
                Alert.alert('Error', 'Failed to delete from server. Please try again.');
                setIsToggling(false);
                return;
              }
            }

            await storage.deleteWorkoutDatabaseId(userId, completedSessionId);
          }

          await storage.markWorkoutSynced(userId, completedSessionId);
          await storage.removeFromCompletedHistory(userId, completedSessionId);
        }

        await markWorkoutCompleted(null);
        await updatePendingCount();
      } catch (error) {
        console.error('[Workout Completion] Error deleting workout:', error);
        Alert.alert('Error', 'Failed to delete workout progress. Please try again.');
      } finally {
        setIsToggling(false);
      }
    } else {
      // Mark as complete workflow
      try {
        setIsToggling(true);

        if (todaysWorkout && activeSplit) {
          const { startWorkout: localStartWorkout, completeWorkout: localCompleteWorkout } = await import('@/services/storage');

          const splitId = activeSplit.id;
          const dayIndex = (todaysWorkout.dayNumber || 1) - 1;
          const workout = await localStartWorkout(userId, splitId, dayIndex);

          if (workout.exercises && workout.exercises.length > 0) {
            workout.exercises.forEach(exercise => {
              if (exercise.sets) {
                exercise.sets.forEach(set => {
                  set.completed = true;
                  set.reps = set.reps || 0;
                  set.weight = set.weight || 0;
                });
              }
            });
          }

          await storage.saveActiveWorkout(userId, workout);
          await localCompleteWorkout(userId, workout.id);

          await updatePendingCount();

          // Fire-and-forget sync — don't block completion for network call
          syncPendingWorkouts(userId).catch(e =>
            console.warn('[Workout Completion] Sync failed, will retry later:', e.message)
          );

          await markWorkoutCompleted(workout.id, isRestDay);

          return workout.id;
        }
      } catch (error) {
        console.error('[Workout Completion] Error saving quick workout completion:', error);
        Alert.alert('Error', 'Failed to save workout progress. Please try again.');
        setIsToggling(false);
        throw error;
      }
    }
  };

  return {
    isToggling,
    setIsToggling,
    handleToggleCompletion
  };
};
