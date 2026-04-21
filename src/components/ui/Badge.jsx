import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Radius, Spacing, FontSize, FontWeight } from '@/constants/theme';

const Badge = ({ label, color, icon, image, onPress, size = 'md', style }) => {
  const colors = useThemeColors();
  const bgColor = color ? color + '15' : colors.borderLight;
  const textColor = color || colors.secondaryText;
  const isSmall = size === 'sm';
  const imageSize = isSmall ? 14 : 18;

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
          paddingVertical: isSmall ? 2 : Spacing.xs,
        },
        style,
      ]}
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={[styles.image, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}
          contentFit="cover"
        />
      ) : icon ? (
        <Ionicons
          name={icon}
          size={isSmall ? 10 : 12}
          color={textColor}
          style={styles.icon}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          {
            color: textColor,
            fontSize: isSmall ? FontSize.xs : FontSize.sm,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.pill,
  },
  image: {
    marginRight: Spacing.xs,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    fontWeight: FontWeight.medium,
    letterSpacing: 0.2,
  },
});

export default Badge;
