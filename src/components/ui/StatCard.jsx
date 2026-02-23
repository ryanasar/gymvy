import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, FontSize, FontWeight, Radius, Shadows } from '@/constants/theme';

/**
 * StatCard - A reusable card component for displaying statistics with optional chart
 *
 * @param {string} title - Card title
 * @param {React.ReactNode} headerAction - Optional component to display in the header (e.g., TimeRangeToggle)
 * @param {string} label - Label for the main statistic (e.g., "Current", "Est. 1RM")
 * @param {string} value - Main value to display (e.g., "150 lbs")
 * @param {string} change - Change indicator (e.g., "+5 lbs")
 * @param {string} changeColor - Color for the change indicator
 * @param {string} lastLogged - Last logged text (e.g., "Last logged: 2 days ago")
 * @param {string} emptyMessage - Message to show when no data
 * @param {React.ReactNode} chart - Chart component to render
 * @param {React.ReactNode} actionButton - Optional action button at the bottom
 * @param {object} style - Additional styles for the card
 */
const StatCard = ({
  title,
  headerAction,
  label,
  value,
  change,
  changeColor,
  lastLogged,
  emptyMessage,
  chart,
  actionButton,
  style,
}) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          ...Shadows.card,
          shadowColor: colors.shadow,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {headerAction}
      </View>

      <View style={styles.statsContainer}>
        {value ? (
          <>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>
                {label}
              </Text>
              {lastLogged && (
                <Text style={[styles.lastLogged, { color: colors.secondaryText }]}>
                  {lastLogged}
                </Text>
              )}
            </View>
            <Text style={[styles.mainValue, { color: colors.text }]}>
              {value}
            </Text>
            {change && (
              <Text
                style={[
                  styles.changeIndicator,
                  { color: changeColor || colors.accent },
                ]}
              >
                {change}
              </Text>
            )}
          </>
        ) : (
          <Text style={[styles.noData, { color: colors.secondaryText }]}>
            {emptyMessage || 'No data yet'}
          </Text>
        )}
      </View>

      {chart}

      {actionButton}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.card,
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  statsContainer: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  mainValue: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  changeIndicator: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.xs,
  },
  lastLogged: {
    fontSize: FontSize.sm,
  },
  noData: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});

export default StatCard;
