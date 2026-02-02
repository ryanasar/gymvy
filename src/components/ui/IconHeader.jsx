import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

/**
 * IconHeader - A reusable header component with icon/emoji circle, title, subtitle, and optional action
 *
 * @param {string} icon - Emoji or icon to display
 * @param {string} iconBackgroundColor - Background color for the icon circle
 * @param {string} title - Main title text
 * @param {string} titleColor - Color for title (defaults to theme text color)
 * @param {string} subtitle - Subtitle text
 * @param {string} subtitleColor - Color for subtitle
 * @param {React.ReactNode} action - Optional action component (e.g., button or menu) to display on the right
 * @param {object} style - Additional styles for the container
 */
const IconHeader = ({
  icon,
  iconBackgroundColor,
  title,
  titleColor,
  subtitle,
  subtitleColor,
  action,
  style,
}) => {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, { backgroundColor: iconBackgroundColor }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: titleColor || colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: subtitleColor || colors.secondaryText }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  actionContainer: {
    marginLeft: Spacing.sm,
  },
});

export default IconHeader;
