import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { buildBadges } from '@/constants/badges';
import OptionsMenu from '@/components/ui/OptionsMenu';
import ExerciseList from '@/components/ui/ExerciseList';

const SplitWorkoutCard = ({
  todaysWorkout,
  activeSplit,
  isCompleted,
  isToggling,
  hasExercises,
  hasActiveWorkout,
  currentStreak,
  completedSessionId,
  completedWorkoutData, // Actual session data (exercises/sets performed), different from template
  shouldCollapse,
  maxVisibleExercises,
  freeRestDayAvailable,
  onToggleCompletion,
  onOptionsMenuToggle,
  onChangeDayPress,
  onEditWorkoutPress,
  onFreeRestDayPress,
  skipAutoResumeRef,
  isPostProcessing
}) => {
  const colors = useThemeColors();
  const router = useRouter();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // When completed, use the actual session data if available, otherwise fall back to template
  const displayWorkout = isCompleted && completedWorkoutData
    ? {
        ...todaysWorkout,
        exercises: completedWorkoutData.exercises || todaysWorkout.exercises,
      }
    : todaysWorkout;

  const handleOptionsMenuToggle = () => {
    const newValue = !showOptionsMenu;
    setShowOptionsMenu(newValue);
    if (onOptionsMenuToggle) onOptionsMenuToggle(newValue);
  };

  const getMenuItems = () => {
    if (isCompleted) {
      return [
        {
          label: 'Un-complete Workout',
          icon: 'arrow-undo-outline',
          color: '#EF4444',
          onPress: () => {
            setShowOptionsMenu(false);
            Alert.alert(
              'Un-complete Workout?',
              'This will erase your workout progress and you will need to complete it again.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Un-complete',
                  style: 'destructive',
                  onPress: onToggleCompletion,
                },
              ]
            );
          },
        },
      ];
    }

    const items = [
      {
        label: "Change Today's Workout",
        icon: 'calendar-outline',
        onPress: () => {
          setShowOptionsMenu(false);
          onChangeDayPress();
        },
      },
      {
        label: 'Edit Workout',
        icon: 'create-outline',
        onPress: () => {
          setShowOptionsMenu(false);
          onEditWorkoutPress();
        },
      },
      {
        label: 'Mark as Completed',
        icon: 'checkmark-circle-outline',
        color: '#4CAF50',
        onPress: () => {
          setShowOptionsMenu(false);
          onToggleCompletion();
        },
      },
    ];

    if (freeRestDayAvailable) {
      items.push({
        label: 'Take Free Rest Day',
        icon: 'bed-outline',
        color: colors.warning,
        onPress: () => {
          setShowOptionsMenu(false);
          onFreeRestDayPress();
        },
      });
    }

    return items;
  };

  return (
    <View style={[
      styles.workoutCard,
      { backgroundColor: colors.cardBackground, shadowColor: colors.shadow, borderColor: colors.borderLight },
      isCompleted && styles.workoutCardCompleted
    ]}>
      <View style={styles.workoutHeader}>
        <View style={styles.workoutInfo}>
          <View style={styles.workoutTitleRow}>
            <Text style={[styles.workoutTitle, { color: colors.text }]}>{displayWorkout.dayName}</Text>
            <View style={styles.headerActions}>
              <Text style={[styles.exerciseCount, { color: colors.secondaryText }]}>
                {displayWorkout.exercises.length} exercises
              </Text>
              <TouchableOpacity
                style={styles.optionsButton}
                onPress={handleOptionsMenuToggle}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
          </View>
          {activeSplit?.name && (
            <Text style={[styles.splitName, { color: colors.primary }]}>
              {activeSplit.emoji && `${activeSplit.emoji} `}{activeSplit.name}
            </Text>
          )}
          <Text style={[styles.cycleInfo, { color: colors.secondaryText }]}>
            Cycle {todaysWorkout.weekNumber} · Day {todaysWorkout.dayNumber}
          </Text>
        </View>
      </View>

      <OptionsMenu
        visible={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        items={getMenuItems()}
      />

      <ExerciseList
        exercises={displayWorkout.exercises}
        maxVisibleExercises={maxVisibleExercises}
      />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!isCompleted && (
          <>
            {!hasExercises && (
              <View style={[styles.noExercisesWarning, { backgroundColor: colors.borderLight + '40' }]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.secondaryText} />
                <Text style={[styles.noExercisesWarningText, { color: colors.secondaryText }]}>
                  Add exercises to this workout to get started
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.startWorkoutButton,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
                !hasExercises && styles.startWorkoutButtonDisabled
              ]}
              onPress={() => {
                skipAutoResumeRef.current = false;
                router.push({
                  pathname: '/workout/session',
                  params: {
                    workoutData: JSON.stringify(todaysWorkout)
                  }
                });
              }}
              disabled={!hasExercises}
              activeOpacity={!hasExercises ? 1 : 0.7}
            >
              <Text style={[
                styles.startWorkoutText,
                { color: colors.onPrimary },
                !hasExercises && styles.startWorkoutTextDisabled
              ]}>
                {hasActiveWorkout ? 'Resume Workout' : 'Start Workout'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {isCompleted && (
          <TouchableOpacity
            style={[
              styles.postWorkoutButton,
              (isToggling || isPostProcessing) && styles.postWorkoutButtonDisabled
            ]}
            onPress={() => {
              const isSplitCompleted = require('@/utils/workout/workoutCalculations').checkIfSplitCompleted(activeSplit, todaysWorkout);

              // Use database ID if available (from sync), otherwise fall back to local session ID
              const sessionIdForPost = completedWorkoutData?.databaseWorkoutSessionId || completedSessionId;

              const badges = buildBadges({
                streak: currentStreak,
                isSplitCompleted,
                prExercises: completedWorkoutData?.newPRs || [],
              });

              // Use displayWorkout (actual session data if available) for the post
              router.push({
                pathname: '/post/create',
                params: {
                  workoutData: JSON.stringify(displayWorkout),
                  workoutSessionId: sessionIdForPost?.toString() || '',
                  splitId: activeSplit?.id?.toString() || '',
                  badges: badges ? JSON.stringify(badges) : '',
                },
              });
            }}
            disabled={isToggling || isPostProcessing}
            activeOpacity={(isToggling || isPostProcessing) ? 1 : 0.7}
          >
            <View style={styles.postWorkoutContent}>
              {isPostProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.postWorkoutText}>Post Workout</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SplitWorkoutCard;

const styles = StyleSheet.create({
  workoutCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.light.border,
    width: '100%',
  },
  workoutCardCompleted: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50' + '08',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.15,
  },
  workoutHeader: {
    marginBottom: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  splitName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: 4,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  workoutTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    flex: 1,
  },
  exerciseCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.secondaryText,
  },
  cycleInfo: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.secondaryText,
  },
  actionButtons: {
    marginTop: 20,
    gap: 10,
  },
  noExercisesWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  noExercisesWarningText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  startWorkoutButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startWorkoutButtonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  startWorkoutText: {
    color: Colors.light.onPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  startWorkoutTextDisabled: {
    opacity: 0.8,
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryActionButtonDisabled: {
    opacity: 0.5,
  },
  secondaryActionText: {
    color: Colors.light.secondaryText,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  postWorkoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  postWorkoutButtonDisabled: {
    opacity: 0.5,
  },
  postWorkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  postWorkoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionsButton: {
    padding: 4,
    borderRadius: 8,
  },
});
