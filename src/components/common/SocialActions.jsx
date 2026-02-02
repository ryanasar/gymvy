import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';

const SocialActions = ({ isLiked, likeCount, commentCount, onLike, onComment }) => {
  const colors = useThemeColors();

  return (
    <>
      {/* Actions Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isLiked ? `${colors.error}15` : colors.cardBackground }
          ]}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? colors.error : colors.secondaryText}
          />
          <Text style={[
            styles.actionCount,
            { color: isLiked ? colors.error : colors.secondaryText }
          ]}>
            {likeCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}
          onPress={onComment}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={16} color={colors.secondaryText} />
          <Text style={[styles.actionCount, { color: colors.secondaryText }]}>
            {commentCount || 0}
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Comments Link */}
      {commentCount > 0 && (
        <TouchableOpacity style={styles.viewCommentsButton} onPress={onComment}>
          <Text style={[styles.viewCommentsText, { color: colors.secondaryText }]}>
            View {commentCount === 1 ? 'comment' : `all ${commentCount} comments`}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default SocialActions;

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  viewCommentsButton: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 12,
  },
  viewCommentsText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
