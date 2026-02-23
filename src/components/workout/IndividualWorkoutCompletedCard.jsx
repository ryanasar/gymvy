import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import OptionsMenu from '@/components/ui/OptionsMenu';
import ExerciseList from '@/components/ui/ExerciseList';

const IndividualWorkoutCompletedCard = ({ workoutData, onPostWorkout, onUncomplete, isPostProcessing }) => {
  const colors = useThemeColors();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const exercises = workoutData?.exercises || [];
  const workoutName = workoutData?.workoutName || 'Workout';
  const sourceLabel = workoutData?.source === 'freestyle' ? 'Freestyle Workout' : 'Saved Workout';

  const menuItems = [
    {
      label: 'Un-complete Workout',
      icon: 'arrow-undo-outline',
      color: colors.error,
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
              onPress: onUncomplete,
            },
          ]
        );
      },
    },
  ];

  return (
    <View style={[
      styles.workoutCard,
      { backgroundColor: colors.cardBackground, shadowColor: colors.shadow },
      styles.workoutCardCompleted
    ]}>
      {/* Header */}
      <View style={styles.workoutHeader}>
        <View style={styles.workoutInfo}>
          <View style={styles.workoutTitleRow}>
            <Text style={[styles.workoutTitle, { color: colors.text }]}>{workoutName}</Text>
            <View style={styles.headerActions}>
              <Text style={[styles.exerciseCount, { color: colors.secondaryText }]}>
                {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
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
            {sourceLabel}
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
        {/* Post Workout Button */}
        <TouchableOpacity
          style={[styles.postWorkoutButton, isPostProcessing && styles.postWorkoutButtonDisabled]}
          onPress={onPostWorkout}
          disabled={isPostProcessing}
          activeOpacity={isPostProcessing ? 1 : 0.7}
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
      </View>
    </View>
  );
};

export default IndividualWorkoutCompletedCard;

const styles = StyleSheet.create({
  workoutCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 0,
    width: '100%',
  },
  workoutCardCompleted: {
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
  },
  optionsButton: {
    padding: 4,
    borderRadius: 20,
  },
  sourceLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButtons: {
    marginTop: 20,
    gap: 10,
  },
  postWorkoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 20,
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
});
