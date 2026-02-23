import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

const ProgressHighlights = ({ highlights = [] }) => {
  const colors = useThemeColors();
  const defaultHighlights = [
    {
      icon: '🏋️‍♂️',
      title: 'Heaviest Squat',
      value: highlights.find(h => h.type === 'heaviestSquat')?.value || 'No data',
    },
    {
      icon: '💪',
      title: 'Heaviest Bench Press',
      value: highlights.find(h => h.type === 'heaviestBench')?.value || 'No data',
    },
    {
      icon: '🔥',
      title: 'Most Volume in One Day',
      value: highlights.find(h => h.type === 'maxVolume')?.value || 'No data',
    },
    {
      icon: '⏱️',
      title: 'Longest Streak',
      value: highlights.find(h => h.type === 'longestStreak')?.value || 'No data',
    },
    {
      icon: '📊',
      title: 'Total Workouts',
      value: highlights.find(h => h.type === 'totalWorkouts')?.value || '0',
    },
    {
      icon: '💯',
      title: 'Total Sets Completed',
      value: highlights.find(h => h.type === 'totalSets')?.value || '0',
    },
  ];

  const HighlightItem = ({ icon, title, value }) => (
    <View style={[styles.highlightItem, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
      <View style={[styles.highlightIconContainer, { backgroundColor: colors.primary + '15' }]}>
        <Text style={styles.highlightIcon}>{icon}</Text>
      </View>
      <View style={styles.highlightContent}>
        <Text style={[styles.highlightTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.highlightValue, { color: colors.primary }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Highlights</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Your best lifts and milestones</Text>
      </View>

      <View style={styles.highlightsList}>
        {defaultHighlights.map((highlight, index) => (
          <HighlightItem
            key={index}
            icon={highlight.icon}
            title={highlight.title}
            value={highlight.value}
          />
        ))}
      </View>
    </View>
  );
};

export default ProgressHighlights;

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  highlightsList: {
    gap: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  highlightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  highlightIcon: {
    fontSize: 24,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
