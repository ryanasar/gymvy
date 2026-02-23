import React from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import WorkoutPlan from '@/components/common/WorkoutPlan';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Radius, Spacing, FontSize, FontWeight } from '@/constants/theme';

const WorkoutPlansTab = ({ workoutPlans }) => {
    const colors = useThemeColors();
    if (!workoutPlans || workoutPlans.length === 0) {
      return (
        <View style={styles.center}>
            <Text style={{ color: colors.secondaryText }}>No splits</Text>
        </View>
    );
    }

    return (
      <View style={styles.todayContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Workout</Text>
        <FlatList
          data={workoutPlans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <WorkoutPlan plan={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.startButtonText, { color: colors.onPrimary }]}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    );
};

export default WorkoutPlansTab;

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    marginTop: Spacing.container,
  },
  todayContainer: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  startButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  startButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
