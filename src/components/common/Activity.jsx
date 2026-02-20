import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { deletePost, likePost, unlikePost } from '@/services/api/posts';
import { reportPost } from '@/services/api/reports';
import { createLikeNotification, deleteLikeNotification } from '@/services/api/notifications';
import { trackPostLiked, trackPostUnliked } from '@/lib/analytics';
import { Colors } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { BADGE_CONFIG } from '@/constants/badges';
import { exercises } from '@/data/exercises/exerciseDatabase';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import CommentModal from '@/components/common/CommentModal';
import SocialActions from '@/components/common/SocialActions';
import ZoomableImageModal from '@/components/ui/ZoomableImageModal';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Mapping from detailed muscle keys to simplified display names
const MUSCLE_DISPLAY_MAP = {
  // Shoulders
  front_delts: 'Shoulders',
  side_delts: 'Shoulders',
  rear_delts: 'Shoulders',
  shoulders: 'Shoulders',
  // Back
  lats: 'Back',
  middle_back: 'Back',
  rhomboids: 'Back',
  lower_back: 'Back',
  traps: 'Back',
  // Chest
  chest: 'Chest',
  // Arms
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  // Legs
  quadriceps: 'Legs',
  hamstrings: 'Legs',
  glutes: 'Glutes',
  calves: 'Calves',
  inner_thighs: 'Legs',
  ankles: 'Legs',
  // Core
  core: 'Core',
  abs: 'Core',
  obliques: 'Core',
  hip_flexors: 'Core',
};

const Activity = ({ post, currentUserId, onPostUpdated, onPostDeleted, initialOpenComments = false }) => {
  const colors = useThemeColors();
  const router = useRouter();
  const {
    id,
    type,
    title,
    description,
    imageUrl,
    createdAt,
    author,
    workoutSession,
    split,
    streak,
    isSplitCompleted,
    activityType,
    _count,
    likes = [],
    taggedUsers = [],
  } = post;

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [localLikeCount, setLocalLikeCount] = useState(_count?.likes || 0);
  const [localCommentCount, setLocalCommentCount] = useState(_count?.comments || 0);
  const [isLiked, setIsLiked] = useState(
    likes?.some(like => like.userId === currentUserId) || false
  );
  const isLikingRef = useRef(false);
  // Navigation guard to prevent double-click issues
  const isNavigatingRef = useRef(false);

  // Navigation handler with double-click protection
  const handleNavigation = useCallback((path, params = null) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    if (params) {
      router.push({ pathname: path, params });
    } else {
      router.push(path);
    }
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 500);
  }, [router]);

  useEffect(() => {
    const likedFromServer = likes?.some(like => like.userId === currentUserId) || false;
    setIsLiked(likedFromServer);
    setLocalLikeCount(_count?.likes || 0);
    setLocalCommentCount(_count?.comments || 0);
  }, [likes, _count?.likes, _count?.comments, currentUserId]);

  useEffect(() => {
    if (initialOpenComments) {
      setShowCommentsModal(true);
    }
  }, [initialOpenComments]);

  const isOwnPost = currentUserId && author?.id === currentUserId;
  // Use activityType if available, fallback to legacy detection for old posts
  const isRestDay = activityType
    ? ['planned_rest', 'unplanned_rest', 'free_rest'].includes(activityType)
    : (type === 'rest_day' || (!workoutSession && description && description.includes('Recovery:')));

  const workoutData = workoutSession ? {
    dayName: workoutSession.dayName || workoutSession.workoutName || split?.name || 'Workout',
    weekNumber: workoutSession.weekNumber,
    dayNumber: workoutSession.dayNumber,
    exercises: (() => {
      // Try new schema first: workoutSession.sets (direct relation)
      const sets = workoutSession.sets;
      if (sets && sets.length > 0) {
        // Group sets by orderIndex to reconstruct exercise list
        const exerciseMap = new Map();
        sets.forEach(set => {
          const key = set.orderIndex;
          if (!exerciseMap.has(key)) {
            exerciseMap.set(key, {
              name: set.exerciseName,
              exerciseType: set.exerciseType,
              sets: []
            });
          }
          exerciseMap.get(key).sets.push({
            setNumber: set.setNumber,
            weight: set.weight,
            reps: set.reps,
            completed: set.completed,
            durationMinutes: set.durationMinutes,
            incline: set.incline,
            speed: set.speed
          });
        });
        return Array.from(exerciseMap.values());
      }
      // Fallback to old schema: workoutSession.exercises (deprecated)
      return workoutSession.exercises?.map(ex => ({
        name: ex.exerciseName || ex.name,
        sets: ex.sets || []
      })) || [];
    })()
  } : null;

  const totalSets = workoutData?.exercises?.reduce((acc, ex) => {
    return acc + (Array.isArray(ex.sets) ? ex.sets.length : parseInt(ex.sets) || 0);
  }, 0) || 0;

  const restActivities = isRestDay && description ? (() => {
    const match = description.match(/Recovery:\s*(.+?)(?:\n|$)/);
    if (match) {
      return match[1].split(',').map(activity => activity.trim());
    }
    return [];
  })() : [];

  const musclesWorked = workoutData?.exercises ? (() => {
    const displayMuscles = new Set();
    workoutData.exercises.forEach(exercise => {
      const exerciseData = exercises.find(ex =>
        ex.name.toLowerCase() === (exercise.name || '').toLowerCase()
      );
      if (exerciseData?.primaryMuscles) {
        exerciseData.primaryMuscles.forEach(muscle => {
          // Convert to simplified display name
          const displayName = MUSCLE_DISPLAY_MAP[muscle] || muscle;
          displayMuscles.add(displayName);
        });
      }
    });
    return Array.from(displayMuscles);
  })() : [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return minutes < 1 ? 'now' : `${minutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d`;
    } else if (diffInDays < 365) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCardPress = () => {
    if (isRestDay) return;
    if (workoutData) {
      handleNavigation('../workout/workoutDetail', {
        postId: id.toString(),
        workoutData: JSON.stringify(workoutData),
        splitData: split ? JSON.stringify(split) : '',
      });
    }
  };

  const handleProfilePress = () => {
    if (author?.username) {
      handleNavigation(`/user/${author.username}`);
    }
  };

  const handleLike = async () => {
    // Double-check the ref to prevent race conditions
    if (isLikingRef.current) return;
    isLikingRef.current = true;

    // Capture current state to avoid stale closure issues
    const wasLiked = isLiked;
    const currentLikeCount = localLikeCount;

    // Optimistic UI update
    setIsLiked(!wasLiked);
    setLocalLikeCount(wasLiked ? currentLikeCount - 1 : currentLikeCount + 1);

    try {
      if (wasLiked) {
        await unlikePost(id, currentUserId);
        await deleteLikeNotification(currentUserId, id);
        trackPostUnliked();
      } else {
        await likePost(id, currentUserId);
        if (author?.id && author.id !== currentUserId) {
          await createLikeNotification(author.id, currentUserId, id);
        }
        trackPostLiked();
      }
      if (onPostUpdated) {
        const updatedLikes = wasLiked
          ? likes.filter(like => like.userId !== currentUserId)
          : [...likes, { userId: currentUserId }];
        onPostUpdated({
          ...post,
          likes: updatedLikes,
          _count: { ...post._count, likes: wasLiked ? currentLikeCount - 1 : currentLikeCount + 1 }
        });
      }
    } catch (error) {
      // Rollback on error
      setIsLiked(wasLiked);
      setLocalLikeCount(currentLikeCount);
      Alert.alert('Error', 'Failed to update like');
    } finally {
      // Add a small delay before allowing next like to prevent rapid tapping
      setTimeout(() => {
        isLikingRef.current = false;
      }, 300);
    }
  };

  const handleEditPost = () => {
    handleNavigation('/post/create', {
      postId: id.toString(),
      description: description || '',
      workoutData: workoutData ? JSON.stringify(workoutData) : '',
      workoutSessionId: post.workoutSessionId?.toString() || '',
      splitId: post.splitId?.toString() || '',
      imageUrl: imageUrl || '',
      taggedUsers: taggedUsers ? JSON.stringify(taggedUsers) : '',
    });
  };

  const handleDeletePost = () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(id);
            if (onPostDeleted) onPostDeleted(id);
            Alert.alert('Success', 'Post deleted successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete post');
          }
        },
      },
    ]);
  };

  const submitReport = async (reason) => {
    try {
      await reportPost(id, reason);
      Alert.alert('Report Submitted', 'Thank you. We will review this post shortly.');
    } catch (error) {
      if (error.response?.status === 409) {
        Alert.alert('Already Reported', 'You have already reported this post.');
      } else {
        Alert.alert('Error', 'Failed to submit report. Please try again.');
      }
    }
  };

  const handleCommentCountChange = (newCount) => {
    setLocalCommentCount(newCount);
    if (onPostUpdated) {
      onPostUpdated({ ...post, _count: { ...post._count, comments: newCount } });
    }
  };

  const [showMenu, setShowMenu] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showExpandedImage, setShowExpandedImage] = useState(false);

  // Calculate if description needs truncation based on length and line breaks
  const displayDescription = isRestDay
    ? (description?.replace(/Recovery:\s*.+?(?:\n|$)/, '').trim() || 'Took a rest day')
    : description;
  const descriptionNeedsTruncation = displayDescription && (
    displayDescription.length > 200 || // Long text likely wraps to >4 lines
    (displayDescription.match(/\n/g) || []).length >= 4 // Has 4+ explicit line breaks
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.cardBackground, shadowColor: colors.shadow },
        pressed && !isRestDay && styles.cardPressed
      ]}
      onPress={handleCardPress}
      android_ripple={{ color: colors.borderLight }}
      disabled={isRestDay}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.authorInfo} onPress={handleProfilePress} activeOpacity={0.7}>
          <Avatar
            uri={author?.profile?.avatarUrl}
            name={author?.name || author?.username}
            size={38}
          />
          <View style={styles.authorTextContainer}>
            <View style={styles.nameTimestampRow}>
              <Text style={[styles.authorName, { color: colors.text }]}>{author?.name || author?.username || 'Unknown User'}</Text>
              {author?.profile?.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#1D9BF0" style={styles.verifiedBadge} />
              )}
              <Text style={[styles.timestampInline, { color: colors.secondaryText }]}>· {formatDate(createdAt)}</Text>
            </View>
            {author?.name && author?.username && (
              <Text style={[styles.authorUsername, { color: colors.secondaryText }]}>
                @{author.username}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Overflow Menu */}
      {showMenu && (
        <View style={[styles.menuOverlay, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
          {isOwnPost ? (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowMenu(false); handleEditPost(); }}
              >
                <Ionicons name="pencil" size={18} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDanger]}
                onPress={() => { setShowMenu(false); handleDeletePost(); }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text style={[styles.menuItemText, { color: colors.error }]}>Delete Post</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => {
                setShowMenu(false);
                Alert.alert(
                  'Report Post',
                  'Why are you reporting this post?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Spam', onPress: () => submitReport('Spam') },
                    { text: 'Inappropriate', onPress: () => submitReport('Inappropriate content') },
                    { text: 'Harassment', onPress: () => submitReport('Harassment or bullying') },
                  ]
                );
              }}
            >
              <Ionicons name="flag-outline" size={18} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>Report Post</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content Body */}
      <View style={[styles.contentBody, !imageUrl && styles.contentBodyNoImage]}>
        <Text style={[styles.typeLabel, { color: isRestDay ? colors.accent : colors.primary }]}>{isRestDay ? 'REST DAY' : 'WORKOUT'}</Text>
        {isRestDay ? (
          <Text style={[styles.workoutName, { color: colors.text }]}>Rest & Recover</Text>
        ) : (
          <Text style={[styles.workoutName, { color: colors.text }]}>
            {title || workoutData?.dayName || 'Workout'}
          </Text>
        )}
        {displayDescription && (
          <View>
            <Text
              style={[styles.description, { color: colors.secondaryText }]}
              numberOfLines={isDescriptionExpanded ? undefined : 4}
              ellipsizeMode="tail"
            >
              {displayDescription}
            </Text>
            {descriptionNeedsTruncation && (
              <TouchableOpacity onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)} activeOpacity={0.7}>
                <Text style={[styles.showMoreText, { color: colors.primary }]}>
                  {isDescriptionExpanded ? 'show less' : 'show more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Post Image */}
      {imageUrl && (
        <View style={styles.imageContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowExpandedImage(true)}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.postImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Metadata Section */}
      <View style={[styles.metadataSection, !imageUrl && styles.metadataSectionNoImage]}>
        {(() => {
          // Use badges array if available, otherwise fall back to legacy columns
          const badgeList = post.badges || (() => {
            const fallback = [];
            if (streak && streak > 1) fallback.push({ type: 'streak', value: streak });
            if (isSplitCompleted) fallback.push({ type: 'split_completed' });
            return fallback;
          })();
          return badgeList.length > 0 ? (
            <View style={styles.topBadgesRow}>
              {badgeList.map((badge, idx) => {
                const config = BADGE_CONFIG[badge.type];
                if (!config) return null;
                return (
                  <Badge key={idx} label={config.getLabel(badge)} color={config.color} />
                );
              })}
            </View>
          ) : null;
        })()}

        {taggedUsers && taggedUsers.length > 0 && (
          <View style={styles.taggedBadgesContainer}>
            {taggedUsers.map((taggedUser) => (
              <Badge
                key={taggedUser.id}
                label={`🏋️ @${taggedUser.username}`}
                color={colors.primary}
                onPress={() => handleNavigation(`/user/${taggedUser.username}`)}
              />
            ))}
          </View>
        )}

        <View style={styles.badgesContainer}>
          {isRestDay && restActivities && restActivities.length > 0 && restActivities.map((activity, index) => (
            <Badge key={index} label={activity} color={colors.accent} />
          ))}
          {!isRestDay && musclesWorked && musclesWorked.length > 0 && musclesWorked.map((muscle, index) => (
            <Badge key={index} label={muscle} color={colors.primary} />
          ))}
        </View>

        {workoutData && !isRestDay && (
          <View style={styles.statsRow}>
            <Text style={[styles.statsText, { color: colors.secondaryText }]}>
              {totalSets} {totalSets === 1 ? 'set' : 'sets'} • {workoutData.exercises?.length || 0} {workoutData.exercises?.length === 1 ? 'exercise' : 'exercises'}
            </Text>
            <Text style={[styles.tapHintText, { color: colors.secondaryText }]}>• Tap to view</Text>
          </View>
        )}
      </View>

      {/* Social Actions */}
      <SocialActions
        isLiked={isLiked}
        likeCount={localLikeCount}
        commentCount={localCommentCount}
        onLike={handleLike}
        onComment={() => setShowCommentsModal(true)}
      />

      {/* Comments Modal */}
      <CommentModal
        visible={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        postId={id}
        postAuthorId={author?.id}
        currentUserId={currentUserId}
        comments={comments}
        setComments={setComments}
        commentCount={localCommentCount}
        onCommentCountChange={handleCommentCountChange}
      />

      {/* Expanded Image Modal */}
      <ZoomableImageModal
        visible={showExpandedImage}
        onClose={() => setShowExpandedImage(false)}
        imageUri={imageUrl}
      />
    </Pressable>
  );
};

export default Activity;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 0,
    overflow: 'hidden',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.98,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  authorTextContainer: {
    flex: 1,
  },
  nameTimestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 15,
  },
  verifiedBadge: {
    marginLeft: 2,
  },
  timestampInline: {
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.6,
  },
  authorUsername: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 1,
    opacity: 0.6,
  },
  menuButton: {
    padding: 4,
  },
  menuOverlay: {
    position: 'absolute',
    top: 50,
    right: 18,
    borderRadius: 14,
    borderWidth: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 1000,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.borderLight + '30',
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  contentBody: {
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  contentBodyNoImage: {
    paddingBottom: 0,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
    opacity: 0.7,
  },
  workoutName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    opacity: 0.9,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
  imageContainer: {
    paddingHorizontal: 18,
  },
  postImage: {
    width: '100%',
    height: 340,
    borderRadius: 16,
    backgroundColor: Colors.light.borderLight + '20',
  },
  metadataSection: {
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 12,
  },
  metadataSectionNoImage: {
    paddingTop: 6,
  },
  topBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  taggedBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  tapHintText: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.5,
    fontStyle: 'italic',
  },
});
