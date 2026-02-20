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
            { backgroundColor: isLiked ? `${colors.error}15` : 'transparent' }
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
          style={[styles.actionButton, { backgroundColor: 'transparent' }]}
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
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewCommentsButton: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
  },
  viewCommentsText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
