import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import Badge from '@/components/ui/Badge';

const MAX_VISIBLE = 3;

const CommunityBadges = ({ communities }) => {
  const router = useRouter();
  const colors = useThemeColors();

  if (!communities || communities.length === 0) return null;

  const visible = communities.slice(0, MAX_VISIBLE);
  const overflow = communities.length - MAX_VISIBLE;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {visible.map((community) => (
        <Badge
          key={community.id}
          label={community.name}
          image={community.imageUrl}
          color={community.color || colors.primary}
          size="md"
          onPress={() => router.push(`/community/${community.id}`)}
        />
      ))}
      {overflow > 0 && (
        <Badge
          label={`+${overflow} more`}
          color={colors.secondaryText}
          size="md"
        />
      )}
    </ScrollView>
  );
};

export default CommunityBadges;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
});
