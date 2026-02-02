import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, FontSize, FontWeight } from '@/constants/theme';
import { exercises as exerciseDatabaseSource } from '@/data/exercises/exerciseDatabase';

/**
 * Check if an exercise is a cardio exercise
 * Looks up the exercise type from the database if not directly on the exercise object
 */
const isCardioExercise = (exercise) => {
  if (exercise?.exerciseType === 'cardio') return true;
  if (exercise?.template?.exerciseType === 'cardio') return true;
  if (exercise?.exerciseTemplate?.exerciseType === 'cardio') return true;

  // Look up in the database by id or name
  const dbExercise = exerciseDatabaseSource.find(e =>
    e.id === exercise?.id ||
    e.id?.toString() === exercise?.id?.toString() ||
    e.name === exercise?.name
  );
  return dbExercise?.exerciseType === 'cardio';
};

/**
 * Format exercise details based on type (cardio vs strength)
 */
const formatExerciseDetails = (exercise) => {
  if (isCardioExercise(exercise)) {
    const parts = [];
    if (exercise.duration) parts.push(`${exercise.duration} min`);
    if (exercise.incline) parts.push(`${exercise.incline}% incline`);
    if (exercise.speed) parts.push(`speed ${exercise.speed}`);
    return parts.join(' · ');
  }

  // Strength exercise - show sets and reps
  const parts = [];
  const sets = exercise.sets || exercise.completedSets;
  if (sets) parts.push(`${sets} sets`);
  if (exercise.reps) parts.push(`${exercise.reps} reps`);
  return parts.join(' · ');
};

/**
 * ExerciseList - A reusable expandable/collapsible exercise list component
 *
 * @param {Array} exercises - Array of exercise objects with structure: { name, sets, reps, completedSets }
 * @param {number} maxVisibleExercises - Number of exercises to show before collapsing (default: 5)
 * @param {boolean} showNumbers - Whether to show exercise numbers (default: true)
 * @param {object} style - Additional styles for the container
 */
const ExerciseList = ({
  exercises = [],
  maxVisibleExercises = 5,
  showNumbers = true,
  style,
}) => {
  const colors = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);

  if (exercises.length === 0) {
    return null;
  }

  const shouldCollapse = exercises.length > maxVisibleExercises;
  const visibleExercises = isExpanded || !shouldCollapse
    ? exercises
    : exercises.slice(0, maxVisibleExercises);

  return (
    <View style={[styles.container, style]}>
      {visibleExercises.map((exercise, index) => (
        <View
          key={index}
          style={[
            styles.exerciseItem,
            { borderBottomColor: colors.borderLight + '40' },
          ]}
        >
          <View style={styles.exerciseContent}>
            <Text style={[styles.exerciseName, { color: colors.text }]}>
              {showNumbers && `${index + 1}. `}
              {exercise.name}
            </Text>
            <Text style={[styles.exerciseDetails, { color: colors.secondaryText }]}>
              {formatExerciseDetails(exercise)}
            </Text>
          </View>
        </View>
      ))}

      {shouldCollapse && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={[styles.showMoreText, { color: colors.primary }]}>
            {isExpanded
              ? 'Show less'
              : `Show ${exercises.length - maxVisibleExercises} more`}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xs,
  },
  exerciseItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  exerciseContent: {
    gap: Spacing.xs,
  },
  exerciseName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    lineHeight: 20,
  },
  exerciseDetails: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  showMoreText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});

export default ExerciseList;
