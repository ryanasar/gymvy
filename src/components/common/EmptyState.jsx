import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import Button from '@/components/ui/Button';

/**
 * Shared EmptyState component for consistent styling across the app
 *
 * @param {string} icon - Ionicons icon name (e.g., 'barbell-outline')
 * @param {string} emoji - Emoji to display instead of icon (e.g., '📝')
 * @param {string} title - Main title text
 * @param {string} message - Optional subtitle/message text
 * @param {string} ctaText - Optional CTA button text
 * @param {function} onCtaPress - Optional CTA button press handler
 * @param {string} ctaIcon - Optional icon for CTA button
 */
const EmptyState = ({
  icon,
  emoji,
  title,
  message,
  ctaText,
  onCtaPress,
  ctaIcon,
}) => {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      {/* Icon or Emoji */}
      <View style={[styles.iconContainer, { backgroundColor: colors.border + '25' }]}>
        {emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : icon ? (
          <Ionicons name={icon} size={48} color={colors.secondaryText} />
        ) : null}
      </View>

      {/* Title */}
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}

      {/* Message */}
      {message && <Text style={[styles.message, { color: colors.secondaryText, opacity: 0.7 }]}>{message}</Text>}

      {/* CTA Button */}
      {ctaText && onCtaPress && (
        <Button
          title={ctaText}
          icon={ctaIcon}
          onPress={onCtaPress}
          size="lg"
          style={styles.ctaButton}
        />
      )}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  ctaButton: {
    minWidth: 200,
  },
});
