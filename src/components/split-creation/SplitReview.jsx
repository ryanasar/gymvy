import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

const SplitReview = ({ splitData }) => {
  const colors = useThemeColors();

  const getTotalExercises = () => {
    return splitData.workoutDays.reduce((total, day) => {
      return total + (day.exercises ? day.exercises.length : 0);
    }, 0);
  };

  const getWorkoutDaysCount = () => {
    return splitData.workoutDays.filter(day => !day.isRest).length;
  };

  const getRestDaysCount = () => {
    return splitData.workoutDays.filter(day => day.isRest).length;
  };

  const StatCard = ({ icon, value, label, color }) => (
    <View style={[styles.statCard, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} style={styles.statIcon} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Hero Section */}
      <View style={[styles.heroSection, { backgroundColor: colors.primary + '10' }]}>
        <View style={[styles.emojiContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={styles.heroEmoji}>{splitData.emoji}</Text>
        </View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>{splitData.name}</Text>
        {splitData.description ? (
          <Text style={[styles.heroDescription, { color: colors.secondaryText }]}>
            {splitData.description}
          </Text>
        ) : null}
        <View style={[styles.visibilityBadge, { backgroundColor: splitData.isPublic ? colors.primary + '20' : colors.borderLight }]}>
          <Ionicons
            name={splitData.isPublic ? 'globe-outline' : 'lock-closed-outline'}
            size={14}
            color={splitData.isPublic ? colors.primary : colors.secondaryText}
          />
          <Text style={[styles.visibilityText, { color: splitData.isPublic ? colors.primary : colors.secondaryText }]}>
            {splitData.isPublic ? 'Public' : 'Private'}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="calendar-outline"
          value={splitData.totalDays}
          label="Days"
          color={colors.primary}
        />
        <StatCard
          icon="barbell-outline"
          value={getWorkoutDaysCount()}
          label="Workouts"
          color="#10B981"
        />
        <StatCard
          icon="bed-outline"
          value={getRestDaysCount()}
          label="Rest"
          color="#F59E0B"
        />
        <StatCard
          icon="fitness-outline"
          value={getTotalExercises()}
          label="Exercises"
          color="#8B5CF6"
        />
      </View>

      {/* Schedule Section */}
      <View style={styles.scheduleSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Schedule</Text>

        {splitData.workoutDays.map((day, index) => (
          <View
            key={index}
            style={[
              styles.dayCard,
              {
                backgroundColor: colors.cardBackground,
                borderLeftColor: day.isRest ? '#F59E0B' : colors.primary,
              }
            ]}
          >
            <View style={styles.dayCardHeader}>
              <View style={[styles.dayBadge, { backgroundColor: day.isRest ? '#F59E0B20' : colors.primary + '20' }]}>
                <Text style={[styles.dayBadgeText, { color: day.isRest ? '#F59E0B' : colors.primary }]}>
                  Day {index + 1}
                </Text>
              </View>
              {day.isRest && (
                <View style={[styles.restIndicator, { backgroundColor: '#F59E0B20' }]}>
                  <Ionicons name="bed-outline" size={14} color="#F59E0B" />
                  <Text style={[styles.restIndicatorText, { color: '#F59E0B' }]}>Rest</Text>
                </View>
              )}
            </View>

            <View style={styles.dayContent}>
              <Text style={styles.dayEmoji}>{day.emoji}</Text>
              <View style={styles.dayInfo}>
                <Text style={[styles.dayName, { color: colors.text }]}>
                  {day.workoutName || (day.isRest ? 'Rest Day' : 'Unnamed Workout')}
                </Text>
                {day.workoutDescription ? (
                  <Text style={[styles.dayDescription, { color: colors.secondaryText }]} numberOfLines={1}>
                    {day.workoutDescription}
                  </Text>
                ) : null}
              </View>
            </View>

            {!day.isRest && day.exercises && day.exercises.length > 0 && (
              <View style={[styles.exercisesContainer, { borderTopColor: colors.borderLight }]}>
                {day.exercises.slice(0, 4).map((exercise, exerciseIndex) => (
                  <View key={exerciseIndex} style={styles.exerciseRow}>
                    <View style={[styles.exerciseDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.exerciseName, { color: colors.text }]} numberOfLines={1}>
                      {exercise.name}
                    </Text>
                    <Text style={[styles.exerciseSets, { color: colors.secondaryText }]}>
                      {exercise.sets || exercise.targetSets || 3}×{exercise.reps || exercise.targetReps || 10}
                    </Text>
                  </View>
                ))}
                {day.exercises.length > 4 && (
                  <Text style={[styles.moreExercises, { color: colors.primary }]}>
                    +{day.exercises.length - 4} more
                  </Text>
                )}
              </View>
            )}

            {!day.isRest && (!day.exercises || day.exercises.length === 0) && (
              <View style={[styles.emptyExercises, { borderTopColor: colors.borderLight }]}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.secondaryText} />
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                  No exercises added
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Ready Message */}
      <View style={[styles.readyCard, { backgroundColor: colors.success + '15', shadowColor: colors.shadow }]}>
        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        <View style={styles.readyContent}>
          <Text style={[styles.readyTitle, { color: colors.success }]}>Ready to go!</Text>
          <Text style={[styles.readyDescription, { color: colors.secondaryText }]}>
            Your split is configured and ready to be saved.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SplitReview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  heroEmoji: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  visibilityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: -8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scheduleSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  dayCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  restIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  restIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
  },
  dayDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  exercisesContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  exerciseName: {
    flex: 1,
    fontSize: 14,
  },
  exerciseSets: {
    fontSize: 13,
    fontWeight: '600',
  },
  moreExercises: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 16,
  },
  emptyExercises: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
  },
  readyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  readyContent: {
    flex: 1,
  },
  readyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  readyDescription: {
    fontSize: 13,
    marginTop: 2,
  },
});
