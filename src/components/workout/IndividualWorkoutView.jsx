import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import IndividualWorkoutCompletedCard from './IndividualWorkoutCompletedCard';
import SavedWorkoutPicker from './SavedWorkoutPicker';
import SavedWorkoutDetailCard from './SavedWorkoutDetailCard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { buildBadges } from '@/constants/badges';

const IndividualWorkoutView = ({
  individualWorkoutCompleted,
  completedIndividualWorkout,
  savedWorkouts,
  selectedSavedWorkout,
  currentStreak,
  onUncomplete,
  onEditWorkout,
  onSelectWorkout,
  onBackFromWorkout,
  onMarkComplete,
  isPostProcessing
}) => {
  const colors = useThemeColors();
  const router = useRouter();

  // Show completed card if workout is completed
  if (individualWorkoutCompleted && completedIndividualWorkout) {
    return (
      <View style={styles.contentContainer}>
        <IndividualWorkoutCompletedCard
          workoutData={completedIndividualWorkout}
          isPostProcessing={isPostProcessing}
          onPostWorkout={() => {
            // Format workout data like split workouts for consistent post creation
            const workoutDataForPost = {
              dayName: completedIndividualWorkout.workoutName || 'Workout',
              exercises: completedIndividualWorkout.exercises || [],
              source: completedIndividualWorkout.source || 'freestyle',
            };
            const badges = buildBadges({
              streak: currentStreak || 0,
              prExercises: completedIndividualWorkout.newPRs || [],
            });
            router.push({
              pathname: '/post/create',
              params: {
                workoutData: JSON.stringify(workoutDataForPost),
                workoutSessionId: completedIndividualWorkout.workoutSessionId?.toString() || '',
                badges: badges ? JSON.stringify(badges) : '',
              },
            });
          }}
          onUncomplete={onUncomplete}
        />
      </View>
    );
  }

  // Show selected workout detail view
  if (selectedSavedWorkout) {
    return (
      <SavedWorkoutDetailCard
        workout={selectedSavedWorkout}
        onBack={onBackFromWorkout}
        onEdit={onEditWorkout}
        onMarkComplete={onMarkComplete}
      />
    );
  }

  // Show workout selection view
  return (
    <View style={styles.noSplitScrollContent}>
      {/* Freestyle Workout Option */}
      <TouchableOpacity
        style={[styles.freestyleCard, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}
        onPress={() => router.push({ pathname: '/workout/session', params: { source: 'freestyle' } })}
        activeOpacity={0.8}
      >
        <View style={[styles.freestyleIconContainer, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="flash" size={22} color={colors.primary} />
        </View>
        <View style={styles.freestyleContent}>
          <Text style={[styles.freestyleTitle, { color: colors.text }]}>Freestyle Workout</Text>
          <Text style={[styles.freestyleSubtitle, { color: colors.secondaryText }]}>
            Add exercises as you go
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
      </TouchableOpacity>

      {/* Saved Workouts Section */}
      {savedWorkouts.length > 0 ? (
        <View style={styles.savedWorkoutsSection}>
          <Text style={[styles.savedWorkoutsSectionTitle, { color: colors.text }]}>
            Saved Workouts
          </Text>
          <SavedWorkoutPicker
            workouts={savedWorkouts}
            onSelect={onSelectWorkout}
          />
        </View>
      ) : (
        <View style={styles.createWorkoutSection}>
          <View style={[styles.noWorkoutsCard, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
            <Ionicons name="barbell-outline" size={48} color={colors.secondaryText} style={{ marginBottom: 16 }} />
            <Text style={[styles.noWorkoutsTitle, { color: colors.text }]}>No Saved Workouts</Text>
            <Text style={[styles.noWorkoutsSubtitle, { color: colors.secondaryText }]}>
              Create a custom workout to reuse anytime
            </Text>
            <TouchableOpacity
              style={[styles.createWorkoutButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/workout/make-workout')}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createWorkoutButtonText}>Create a Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default IndividualWorkoutView;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 20,
    flex: 1,
    alignItems: 'stretch',
  },
  noSplitScrollContent: {
    paddingHorizontal: 6,
    paddingTop: 12,
    paddingBottom: 40,
  },
  freestyleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    borderWidth: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  freestyleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  freestyleContent: {
    flex: 1,
  },
  freestyleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  freestyleSubtitle: {
    fontSize: 13,
  },
  savedWorkoutsSection: {
    marginTop: 28,
  },
  savedWorkoutsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createWorkoutSection: {
    marginTop: 36,
    alignItems: 'center',
  },
  noWorkoutsCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 20,
    borderWidth: 0,
    width: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  noWorkoutsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noWorkoutsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  createWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 6,
  },
  createWorkoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
