import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import OptionsMenu from '@/components/ui/OptionsMenu';
import ExerciseList from '@/components/ui/ExerciseList';

const SavedWorkoutDetailCard = ({
  workout,
  onBack,
  onEdit,
  onMarkComplete,
}) => {
  const colors = useThemeColors();
  const router = useRouter();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const exercises = workout?.exercises || [];

  const menuItems = [
    {
      label: 'Edit Workout',
      icon: 'create-outline',
      onPress: () => {
        setShowOptionsMenu(false);
        router.push({
          pathname: '/workout/edit',
          params: { type: 'saved', savedWorkoutId: workout.id }
        });
      },
    },
    {
      label: 'Mark as Complete',
      icon: 'checkmark-circle-outline',
      color: '#4CAF50',
      onPress: () => {
        setShowOptionsMenu(false);
        onMarkComplete?.(workout);
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
        <Text style={[styles.backButtonText, { color: colors.primary }]}>All Saved Workouts</Text>
      </TouchableOpacity>

      {/* Workout Card - matches SplitWorkoutCard styling */}
      <View style={[
        styles.workoutCard,
        { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }
      ]}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutInfo}>
            <View style={styles.workoutTitleRow}>
              <Text style={[styles.workoutTitle, { color: colors.text }]}>{workout.name}</Text>
              <View style={styles.headerActions}>
                <Text style={[styles.exerciseCount, { color: colors.secondaryText }]}>
                  {exercises.length} exercises
                </Text>
                <TouchableOpacity
                  style={styles.optionsButton}
                  onPress={() => setShowOptionsMenu(!showOptionsMenu)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.sourceLabel, { color: colors.primary }]}>
              {workout.emoji && `${workout.emoji} `}SAVED WORKOUT
            </Text>
          </View>
        </View>

        <OptionsMenu
          visible={showOptionsMenu}
          onClose={() => setShowOptionsMenu(false)}
          items={menuItems}
        />

        <ExerciseList exercises={exercises} />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {exercises.length === 0 ? (
            <View style={[styles.noExercisesWarning, { backgroundColor: colors.borderLight + '40' }]}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.secondaryText} />
              <Text style={[styles.noExercisesWarningText, { color: colors.secondaryText }]}>
                Add exercises to this workout to get started
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.startWorkoutButton,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
              exercises.length === 0 && styles.startWorkoutButtonDisabled
            ]}
            onPress={() => {
              router.push({
                pathname: '/workout/session',
                params: { source: 'saved', savedWorkoutId: workout.id }
              });
            }}
            disabled={exercises.length === 0}
            activeOpacity={exercises.length === 0 ? 1 : 0.7}
          >
            <Text style={[
              styles.startWorkoutText,
              { color: colors.onPrimary },
              exercises.length === 0 && styles.startWorkoutTextDisabled
            ]}>
              Start Workout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SavedWorkoutDetailCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingTop: 12,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  workoutCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 0,
    width: '100%',
  },
  workoutHeader: {
    marginBottom: 16,
  },
  workoutInfo: {
    flex: 1,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.secondaryText,
  },
  sourceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsButton: {
    padding: 4,
    borderRadius: 8,
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
    borderRadius: 16,
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
});
