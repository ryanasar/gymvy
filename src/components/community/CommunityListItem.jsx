import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import Badge from '@/components/ui/Badge';

const CommunityListItem = ({ community, onPress }) => {
  const colors = useThemeColors();

  const roleBadge = community.userRole === 'OWNER' || community.userRole === 'ADMIN'
    ? community.userRole
    : null;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(community)}
      style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}
    >
      <View style={styles.row}>
        {community.imageUrl ? (
          <Image source={{ uri: community.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.borderLight }]}>
            <Ionicons name="people" size={24} color={colors.secondaryText} style={{ opacity: 0.6 }} />
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {community.name}
            </Text>
            {roleBadge && (
              <Badge label={roleBadge} size="sm" color={colors.primary} />
            )}
          </View>
          <Text style={[styles.memberCount, { color: colors.secondaryText }]}>
            {community._count?.members || 0} {(community._count?.members || 0) === 1 ? 'member' : 'members'}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} style={{ opacity: 0.4 }} />
      </View>
    </TouchableOpacity>
  );
};

export default CommunityListItem;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 0,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    flexShrink: 1,
    letterSpacing: 0.1,
  },
  memberCount: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.6,
  },
});
