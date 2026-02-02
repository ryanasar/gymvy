import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Radius, Spacing, FontSize, FontWeight, Shadows } from '@/constants/theme';

/**
 * OptionsMenu - A reusable dropdown menu component
 *
 * @param {boolean} visible - Whether the menu is visible
 * @param {function} onClose - Callback when menu should close
 * @param {Array} items - Array of menu items with structure: { label, icon, onPress, color, destructive }
 * @param {object} style - Additional styles for menu container
 * @param {string} position - Menu position: 'top-right' (default), 'top-left', 'bottom-right', 'bottom-left'
 */
const OptionsMenu = ({ visible, onClose, items = [], style, position = 'top-right' }) => {
  const colors = useThemeColors();

  if (!visible) return null;

  const getPositionStyle = () => {
    switch (position) {
      case 'top-left':
        return { top: 60, left: 20 };
      case 'bottom-right':
        return { bottom: 60, right: 20 };
      case 'bottom-left':
        return { bottom: 60, left: 20 };
      case 'top-right':
      default:
        return { top: 60, right: 20 };
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={[
          styles.menu,
          {
            backgroundColor: colors.cardBackground,
            shadowColor: colors.shadow,
          },
          getPositionStyle(),
          style,
        ]}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              item.onPress?.();
            }}
          >
            {item.icon && (
              <Ionicons
                name={item.icon}
                size={18}
                color={item.color || colors.text}
              />
            )}
            <Text
              style={[
                styles.menuItemText,
                { color: item.color || colors.text },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    zIndex: 999,
  },
  menu: {
    position: 'absolute',
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    ...Shadows.lg,
    elevation: 8,
    minWidth: 200,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  menuItemText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});

export default OptionsMenu;
