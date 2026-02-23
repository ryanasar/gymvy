import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

/**
 * InfoBanner - A reusable informational banner component
 *
 * @param {string} icon - Ionicons icon name
 * @param {string} iconColor - Color for the icon
 * @param {string} message - Message text to display
 * @param {string} backgroundColor - Background color for the banner
 * @param {string} textColor - Text color
 * @param {object} style - Additional styles for the container
 */
const InfoBanner = ({
  icon = 'information-circle-outline',
  iconColor,
  message,
  backgroundColor,
  textColor,
  style,
}) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor || colors.borderLight + '40',
        },
        style,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={iconColor || colors.primary}
      />
      <Text
        style={[
          styles.message,
          {
            color: textColor || colors.secondaryText,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  message: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
});

export default InfoBanner;
