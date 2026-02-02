import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

const PrivateProfilePlaceholder = () => {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.borderLight + '40' }]}>
        <Ionicons name="lock-closed" size={48} color={colors.secondaryText} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>This Account is Private</Text>
      <Text style={[styles.message, { color: colors.secondaryText }]}>
        Follow this account to see their posts, calendar, and splits.
      </Text>
    </View>
  );
};

export default PrivateProfilePlaceholder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
