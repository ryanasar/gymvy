import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import Badge from '@/components/ui/Badge';
import { Radius, Spacing, Shadows } from '@/constants/theme';

const SplitCard = ({ split, onPress, onDelete, showDelete = false }) => {
  const colors = useThemeColors();
  const { name, totalDays, emoji, isActive, workoutDays } = split;

  // Get list of workout names
  const workoutNames = workoutDays?.map(day => day.name).filter(Boolean).join(' • ') || '';

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(split);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, shadowColor: colors.shadow },
        isActive && styles.activeCard
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.splitInfo}>
          <Text style={styles.emoji}>{emoji}</Text>
          <View style={styles.splitText}>
            <View style={styles.splitHeader}>
              <Text style={[styles.splitName, { color: colors.text }]}>{name}</Text>
              {isActive && <Badge label="ACTIVE" color={colors.primary} size="sm" />}
            </View>
            <Text style={[styles.splitDays, { color: colors.secondaryText }]}>{totalDays} days</Text>
            {workoutNames && <Text style={[styles.workoutNames, { color: colors.secondaryText }]} numberOfLines={1}>{workoutNames}</Text>}
          </View>
        </View>

        <View style={styles.actions}>
          {showDelete && !isActive && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
          <View style={styles.arrow}>
            <Text style={[styles.arrowText, { color: colors.secondaryText }]}>→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SplitCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.card,
    ...Shadows.card,
  },
  activeCard: {
    shadowOpacity: 0.15,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  splitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  splitText: {
    flex: 1,
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  splitName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  splitDays: {
    fontSize: 14,
  },
  workoutNames: {
    fontSize: 12,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  arrow: {
    marginLeft: Spacing.xs,
  },
  arrowText: {
    fontSize: 16,
  },
});
