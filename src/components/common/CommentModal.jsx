import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { createComment, getComments } from '@/services/api/posts';
import { deleteComment } from '@/services/api/comments';
import { createCommentNotification, deleteCommentNotification, createCommentLikeNotification, deleteCommentLikeNotification, createReplyNotification, deleteReplyNotification } from '@/services/api/notifications';
import { toggleCommentLike } from '@/services/api/commentLikes';
import Avatar from '@/components/ui/Avatar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CommentModal = ({
  visible,
  onClose,
  postId,
  postAuthorId,
  currentUserId,
  comments,
  setComments,
  commentCount,
  onCommentCountChange,
}) => {
  const colors = useThemeColors();
  const router = useRouter();
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, username, rootParentId }
  const [expandedComments, setExpandedComments] = useState({}); // { [commentId]: true }
  const lastLoadedCountRef = useRef(null);
  const isLikingCommentRef = useRef({});
  const inputRef = useRef(null);

  const loadComments = async () => {
    // Only refresh if comment count changed or never loaded
    if (lastLoadedCountRef.current === commentCount && comments.length > 0) return;
    setIsLoading(true);
    try {
      const fetched = await getComments(postId, currentUserId);
      setComments(fetched);
      lastLoadedCountRef.current = commentCount;
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShow = () => {
    loadComments();
  };

  const handleClose = () => {
    setCommentText('');
    setReplyingTo(null);
    onClose();
  };

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

  const handleAuthorPress = (username) => {
    if (!username) return;
    handleClose();
    setTimeout(() => {
      router.push(`/user/${username}`);
    }, 100);
  };

  const handleReply = (comment) => {
    const username = comment.author?.username;
    if (!username) return;

    // Determine the root parent for this reply
    const rootParentId = comment.rootParentId || comment.parentId || comment.id;

    setReplyingTo({
      id: comment.id,
      username,
      rootParentId,
      authorId: comment.author?.id || comment.userId,
    });
    setCommentText(`@${username} `);
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentText('');
  };

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleCommentLike = async (comment, isReply = false, parentId = null) => {
    if (isLikingCommentRef.current[comment.id]) return;
    isLikingCommentRef.current[comment.id] = true;

    const wasLiked = comment.isLikedByCurrentUser;
    const prevLikeCount = comment.likeCount;

    // Optimistic update
    if (isReply && parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === comment.id
                    ? {
                        ...r,
                        isLikedByCurrentUser: !wasLiked,
                        likeCount: wasLiked ? prevLikeCount - 1 : prevLikeCount + 1,
                      }
                    : r
                ),
              }
            : c
        )
      );
    } else {
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? {
                ...c,
                isLikedByCurrentUser: !wasLiked,
                likeCount: wasLiked ? prevLikeCount - 1 : prevLikeCount + 1,
              }
            : c
        )
      );
    }

    try {
      const result = await toggleCommentLike(comment.id, currentUserId);

      if (result.liked && result.shouldNotify) {
        await createCommentLikeNotification(
          result.commentAuthorId,
          currentUserId,
          result.postId,
          comment.id
        );
      } else if (!result.liked) {
        await deleteCommentLikeNotification(currentUserId, comment.id);
      }
    } catch (error) {
      // Rollback on error
      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: c.replies.map((r) =>
                    r.id === comment.id
                      ? { ...r, isLikedByCurrentUser: wasLiked, likeCount: prevLikeCount }
                      : r
                  ),
                }
              : c
          )
        );
      } else {
        setComments((prev) =>
          prev.map((c) =>
            c.id === comment.id
              ? { ...c, isLikedByCurrentUser: wasLiked, likeCount: prevLikeCount }
              : c
          )
        );
      }
    } finally {
      isLikingCommentRef.current[comment.id] = false;
    }
  };

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const newComment = await createComment(postId, {
        userId: currentUserId,
        content: commentText,
        parentId: replyingTo?.id || null,
      });

      setCommentText('');

      if (replyingTo) {
        // Add reply to the parent comment's replies array
        const rootId = replyingTo.rootParentId;
        setComments((prev) =>
          prev.map((c) =>
            c.id === rootId
              ? {
                  ...c,
                  replies: [...(c.replies || []), { ...newComment, isLikedByCurrentUser: false, likeCount: 0 }],
                  replyCount: (c.replyCount || 0) + 1,
                }
              : c
          )
        );
        // Auto-expand replies when adding a new one
        setExpandedComments(prev => ({ ...prev, [rootId]: true }));

        // Send reply notification to parent comment author
        if (replyingTo.authorId && replyingTo.authorId !== currentUserId && newComment?.id) {
          await createReplyNotification(
            replyingTo.authorId,
            currentUserId,
            postId,
            newComment.id,
            replyingTo.id
          );
        }
        setReplyingTo(null);
      } else {
        // Add new top-level comment
        setComments((prev) => [{ ...newComment, isLikedByCurrentUser: false, likeCount: 0, replies: [], replyCount: 0 }, ...prev]);

        // Send comment notification to post author
        if (postAuthorId && postAuthorId !== currentUserId && newComment?.id) {
          await createCommentNotification(postAuthorId, currentUserId, postId, newComment.id);
        }
      }

      onCommentCountChange(commentCount + 1);
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (comment, isReply = false, parentId = null) => {
    const hasReplies = !isReply && comment.replies?.length > 0;
    const message = hasReplies
      ? `This comment has ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'} that will also be deleted.`
      : 'Are you sure you want to delete this comment?';

    Alert.alert('Delete Comment?', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await deleteComment(comment.id);
            const deletedCount = 1 + (result.deletedReplyCount || 0);

            if (isReply && parentId) {
              // Remove reply from parent's replies array
              setComments((prev) =>
                prev.map((c) =>
                  c.id === parentId
                    ? {
                        ...c,
                        replies: c.replies.filter((r) => r.id !== comment.id),
                        replyCount: Math.max(0, (c.replyCount || 0) - 1),
                      }
                    : c
                )
              );
              // Delete reply notification
              await deleteReplyNotification(currentUserId, comment.id);
            } else {
              // Remove top-level comment
              setComments((prev) => prev.filter((c) => c.id !== comment.id));
              await deleteCommentNotification(currentUserId, postId, comment.id);
            }

            onCommentCountChange(Math.max(0, commentCount - deletedCount));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete comment');
          }
        },
      },
    ]);
  };

  const renderMentionHighlight = (text) => {
    if (!text) return null;

    // Match @username patterns
    const mentionRegex = /(@\w+)/g;
    const parts = text.split(mentionRegex);

    return parts.map((part, index) => {
      if (part.match(mentionRegex)) {
        return (
          <Text key={index} style={{ color: colors.primary, fontWeight: '500' }}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const renderComment = (comment, isReply = false, parentId = null) => (
    <View style={[styles.commentItem, isReply && styles.replyItem]} key={comment.id}>
      <TouchableOpacity
        onPress={() => handleAuthorPress(comment.author?.username)}
        activeOpacity={0.7}
      >
        <Avatar
          uri={comment.author?.profile?.avatarUrl}
          name={comment.author?.name || comment.author?.username}
          size={isReply ? 32 : 40}
        />
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAuthorInfo}>
            <TouchableOpacity
              onPress={() => handleAuthorPress(comment.author?.username)}
              activeOpacity={0.7}
            >
              <Text style={[styles.commentAuthor, { color: colors.text }, isReply && styles.replyAuthor]}>
                {comment.author?.name || comment.author?.username || 'Unknown User'}
              </Text>
            </TouchableOpacity>
          </View>
          {comment.author?.profile?.isVerified && (
            <Ionicons name="checkmark-circle" size={14} color="#1D9BF0" style={{ marginLeft: -4 }} />
          )}
          <Text style={[styles.commentTimestamp, { color: colors.secondaryText }]}>
            {formatDate(comment.timestamp)}
          </Text>
        </View>
        <Text style={[styles.commentText, { color: colors.text }, isReply && styles.replyText]}>
          {renderMentionHighlight(comment.content)}
        </Text>
        {/* Reply button */}
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => handleReply(comment)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.replyButtonText, { color: colors.secondaryText }]}>Reply</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.commentActions}>
        {(comment.userId === currentUserId || comment.author?.id === currentUserId) && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(comment, isReply, parentId)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => handleCommentLike(comment, isReply, parentId)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={comment.isLikedByCurrentUser ? 'heart' : 'heart-outline'}
            size={16}
            color={comment.isLikedByCurrentUser ? colors.error : colors.secondaryText}
          />
          {comment.likeCount > 0 && (
            <Text style={[styles.likeCount, { color: comment.isLikedByCurrentUser ? colors.error : colors.secondaryText }]}>
              {comment.likeCount}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommentWithReplies = ({ item: comment }) => {
    const replies = comment.replies || [];
    const replyCount = replies.length || comment.replyCount || 0;
    const isExpanded = expandedComments[comment.id];

    return (
      <View>
        {renderComment(comment)}
        {replyCount > 0 && (
          <View style={styles.repliesContainer}>
            {!isExpanded ? (
              <TouchableOpacity
                style={styles.viewRepliesButton}
                onPress={() => toggleReplies(comment.id)}
              >
                <View style={[styles.replyLine, { backgroundColor: colors.borderLight }]} />
                <Text style={[styles.viewRepliesText, { color: colors.primary }]}>
                  View {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.viewRepliesButton}
                  onPress={() => toggleReplies(comment.id)}
                >
                  <View style={[styles.replyLine, { backgroundColor: colors.borderLight }]} />
                  <Text style={[styles.viewRepliesText, { color: colors.primary }]}>
                    Hide replies
                  </Text>
                </TouchableOpacity>
                {replies.map((reply) => renderComment(reply, true, comment.id))}
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      onShow={handleShow}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.title, { color: colors.text }]}>Comments</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderCommentWithReplies}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.text }]}>No comments yet</Text>
                <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>Be the first to comment!</Text>
              </View>
            }
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Reply indicator banner */}
        {replyingTo && (
          <View style={[styles.replyBanner, { backgroundColor: colors.primary + '15', borderTopColor: colors.borderLight }]}>
            <Text style={[styles.replyBannerText, { color: colors.text }]}>
              Replying to <Text style={{ color: colors.primary, fontWeight: '600' }}>@{replyingTo.username}</Text>
            </Text>
            <TouchableOpacity onPress={handleCancelReply} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
        )}

        {/* Comment Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderTopColor: colors.borderLight }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { backgroundColor: colors.borderLight + '30', color: colors.text }]}
              placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Write a comment...'}
              placeholderTextColor={colors.secondaryText}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              blurOnSubmit
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              maxLength={500}
            />
            {commentText.length > 0 && (
              <Text style={[
                styles.charCounter,
                { color: commentText.length >= 450 ? colors.error : colors.secondaryText }
              ]}>
                {commentText.length}/500
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary + '15' },
              (!commentText.trim() || isSubmitting) && styles.sendButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!commentText.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner size="small" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={commentText.trim() ? colors.primary : colors.secondaryText}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  commentsList: {
    padding: 16,
    flexGrow: 1,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  replyItem: {
    marginLeft: 52,
    marginBottom: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  commentAuthorInfo: {
    flexDirection: 'column',
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '600',
  },
  replyAuthor: {
    fontSize: 14,
  },
  commentUsername: {
    fontSize: 12,
    fontWeight: '400',
  },
  commentTimestamp: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  replyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 4,
    gap: 8,
    paddingTop: 2,
  },
  likeButton: {
    alignItems: 'center',
    padding: 4,
  },
  likeCount: {
    fontSize: 11,
    marginTop: 1,
  },
  deleteButton: {
    padding: 4,
  },
  replyButton: {
    marginTop: 4,
    paddingVertical: 2,
  },
  replyButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: -8,
    marginBottom: 12,
  },
  viewRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 52,
    marginBottom: 12,
    gap: 12,
  },
  replyLine: {
    width: 24,
    height: 1,
  },
  viewRepliesText: {
    fontSize: 13,
    fontWeight: '500',
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  replyBannerText: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 120,
    minHeight: 44,
  },
  charCounter: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
