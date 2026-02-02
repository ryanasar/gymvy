import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useAuth } from '@/lib/auth';
import { storage } from '@/services/storage';
import { getSavedWorkoutById, updateSavedWorkout } from '@/services/api/savedWorkouts';
import EditDayStep from '@/components/split-creation/EditDayStep';

const EditWorkoutScreen = () => {
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { todaysWorkout, activeSplit, refreshTodaysWorkout, updateActiveSplit } = useWorkout();

  // Params: type ('split-day' | 'saved'), savedWorkoutId?
  const workoutType = params.type || 'split-day';
  const savedWorkoutId = params.savedWorkoutId;

  const [workoutData, setWorkoutData] = useState(null);
  const [originalWorkoutData, setOriginalWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workoutName, setWorkoutName] = useState('');

  // Load workout data based on type
  useEffect(() => {
    const loadWorkoutData = async () => {
      try {
        setLoading(true);

        // Helper to add unique keys to exercises that don't have them
        const addUniqueKeys = (exercises) => {
          return exercises.map((ex, index) => ({
            ...ex,
            uniqueKey: ex.uniqueKey || `${ex.id || ex.name}-${Date.now()}-${index}`
          }));
        };

        if (workoutType === 'saved' && savedWorkoutId) {
          // Load saved workout by ID
          const savedWorkout = await getSavedWorkoutById(user?.id, savedWorkoutId);
          if (savedWorkout) {
            // Deep clone exercises and add unique keys
            const exercisesCopy = addUniqueKeys(JSON.parse(JSON.stringify(savedWorkout.exercises || [])));
            // Use same keys for original to make comparison work
            setWorkoutData({ exercises: exercisesCopy });
            setOriginalWorkoutData({ exercises: JSON.parse(JSON.stringify(exercisesCopy)) });
            setWorkoutName(savedWorkout.name || 'Saved Workout');
          } else {
            Alert.alert('Error', 'Workout not found');
            router.back();
          }
        } else {
          // Load today's split workout
          if (todaysWorkout?.exercises) {
            // Deep clone exercises and add unique keys
            const exercisesCopy = addUniqueKeys(JSON.parse(JSON.stringify(todaysWorkout.exercises)));
            // Use same keys for original to make comparison work
            setWorkoutData({ exercises: exercisesCopy });
            setOriginalWorkoutData({ exercises: JSON.parse(JSON.stringify(exercisesCopy)) });
            setWorkoutName(todaysWorkout.dayName || "Today's Workout");
          } else {
            Alert.alert('Error', 'No workout data available');
            router.back();
          }
        }
      } catch (error) {
        console.error('Failed to load workout:', error);
        Alert.alert('Error', 'Failed to load workout');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, [workoutType, savedWorkoutId, user?.id, todaysWorkout]);

  // Handle workout data changes from EditDayStep
  const handleWorkoutChange = useCallback((newData) => {
    setWorkoutData(newData);
  }, []);

  // Check if there are unsaved changes
  const hasChanges = useCallback(() => {
    if (!workoutData || !originalWorkoutData) return false;
    return JSON.stringify(workoutData.exercises) !== JSON.stringify(originalWorkoutData.exercises);
  }, [workoutData, originalWorkoutData]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  }, [hasChanges, router]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!workoutData) return;

    try {
      setSaving(true);

      if (workoutType === 'saved' && savedWorkoutId) {
        // Update saved workout via API
        await updateSavedWorkout(user?.id, savedWorkoutId, {
          exercises: workoutData.exercises,
        });
      } else {
        // Update today's split workout in local storage
        if (!activeSplit || !activeSplit.days) {
          Alert.alert('Error', 'No active split found');
          return;
        }

        // Find the current day index
        const currentDayIndex = todaysWorkout?.dayNumber ? todaysWorkout.dayNumber - 1 : 0;

        // Update the split with new exercises
        // Don't include 'name' - WorkoutContext will look it up from exerciseDatabase
        // This ensures proper conversion of targetSets/targetReps to sets/reps for UI
        const updatedDays = [...activeSplit.days];
        updatedDays[currentDayIndex] = {
          ...updatedDays[currentDayIndex],
          exercises: workoutData.exercises.map(ex => ({
            exerciseId: ex.id || ex.exerciseId,
            targetSets: parseInt(ex.sets) || 3,
            targetReps: ex.reps ? parseInt(ex.reps) : null,
            restSeconds: parseInt(ex.restSeconds) || 0,
          })),
        };

        const updatedSplit = {
          ...activeSplit,
          days: updatedDays,
        };

        // Save to storage and update context
        if (user?.id) {
          await storage.saveSplit(user.id, updatedSplit);
        }
        await updateActiveSplit(updatedSplit);

        // Refresh today's workout to reflect changes
        await refreshTodaysWorkout();
      }

      router.back();
    } catch (error) {
      console.error('Failed to save workout:', error);
      Alert.alert('Error', error.message || 'Failed to save workout');
    } finally {
      setSaving(false);
    }
  }, [workoutType, savedWorkoutId, workoutData, user?.id, activeSplit, todaysWorkout, updateActiveSplit, refreshTodaysWorkout, router]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.cardBackground, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.cancelText, { color: colors.secondaryText }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Workout</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.cardBackground, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={handleCancel} disabled={saving}>
          <Text style={[styles.cancelText, { color: colors.secondaryText }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {workoutName}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving || !hasChanges()}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[
              styles.saveText,
              { color: colors.primary },
              !hasChanges() && { color: colors.secondaryText }
            ]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* EditDayStep in workout-edit mode */}
      <EditDayStep
        mode="workout-edit"
        workoutData={workoutData}
        onWorkoutChange={handleWorkoutChange}
      />
    </View>
  );
};

export default EditWorkoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 50,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 50,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
