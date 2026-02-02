import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useNotifications } from '@/contexts/NotificationContext';
import EmptyState from '@/components/common/EmptyState';
import { useAuth } from '@/lib/auth';
import { getUserProfile } from '@/services/api/users';
import { acceptFollowRequest, rejectFollowRequest, getPendingFollowRequests } from '@/services/api/followRequests';

const NotificationsScreen = () => {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, isLoading, refreshNotifications, markAllAsRead } = useNotifications();
  const [actorProfiles, setActorProfiles] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [followRequests, setFollowRequests] = useState({});
  const [processingRequests, setProcessingRequests] = useState({});


  // Mark all notifications as read when viewing this screen
  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // Fetch actor profiles for notifications
  useEffect(() => {
    const fetchActorProfiles = async () => {
      const actorIds = [...new Set(notifications.map(n => n.actor_id))];
      const profiles = {};

      await Promise.all(
        actorIds.map(async (actorId) => {
          if (!actorProfiles[actorId]) {
            try {
              const profile = await getUserProfile(actorId);
              profiles[actorId] = profile;
            } catch (error) {
              console.error('Error fetching actor profile:', error);
            }
          }
        })
      );

      if (Object.keys(profiles).length > 0) {
        setActorProfiles(prev => ({ ...prev, ...profiles }));
      }
    };

    if (notifications.length > 0) {
      fetchActorProfiles();
    }
  }, [notifications]);

  // Fetch pending follow requests to map actor_id to request_id
  useEffect(() => {
    const fetchFollowRequests = async () => {
      try {
        const requests = await getPendingFollowRequests();
        const requestsMap = {};
        requests.forEach(req => {
          requestsMap[req.requesterId.toString()] = req.id;
        });
        setFollowRequests(requestsMap);
      } catch (error) {
        console.error('Error fetching follow requests:', error);
      }
    };

    // Only fetch if there are follow_request notifications
    const hasFollowRequests = notifications.some(n => n.type === 'follow_request');
    if (hasFollowRequests) {
      fetchFollowRequests();
    }
  }, [notifications]);

  const handleAcceptFollowRequest = async (actorId) => {
    const requestId = followRequests[actorId];
    if (!requestId) {
      console.error('Follow request not found for actor:', actorId);
      return;
    }

    setProcessingRequests(prev => ({ ...prev, [actorId]: 'accepting' }));
    try {
      await acceptFollowRequest(requestId);
      // Refresh notifications to update the list
      await refreshNotifications();
    } catch (error) {
      console.error('Error accepting follow request:', error);
    } finally {
      setProcessingRequests(prev => ({ ...prev, [actorId]: null }));
    }
  };

  const handleRejectFollowRequest = async (actorId) => {
    const requestId = followRequests[actorId];
    if (!requestId) {
      console.error('Follow request not found for actor:', actorId);
      return;
    }

    setProcessingRequests(prev => ({ ...prev, [actorId]: 'rejecting' }));
    try {
      await rejectFollowRequest(requestId);
      // Refresh notifications to update the list
      await refreshNotifications();
    } catch (error) {
      console.error('Error rejecting follow request:', error);
    } finally {
      setProcessingRequests(prev => ({ ...prev, [actorId]: null }));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNotifications();
    setIsRefreshing(false);
  };

  const getNotificationText = (type) => {
    switch (type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'tag':
        return 'tagged you in a post';
      case 'comment_like':
        return 'liked your comment';
      case 'reply':
        return 'replied to your comment';
      case 'follow_request':
        return 'requested to follow you';
      case 'follow_request_accepted':
        return 'accepted your follow request';
      case 'nudge':
        return 'sent you a nudge';
      default:
        return 'interacted with you';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return { name: 'heart', color: colors.error };
      case 'comment':
        return { name: 'chatbubble', color: colors.primary };
      case 'follow':
        return { name: 'person-add', color: colors.accent };
      case 'tag':
        return { name: 'pricetag', color: colors.primary };
      case 'comment_like':
        return { name: 'heart', color: colors.error };
      case 'reply':
        return { name: 'chatbubble-outline', color: colors.primary };
      case 'follow_request':
        return { name: 'person-add-outline', color: colors.accent };
      case 'follow_request_accepted':
        return { name: 'checkmark-circle', color: colors.success || '#10B981' };
      case 'nudge':
        return { name: 'barbell-outline', color: colors.accent };
      default:
        return { name: 'notifications', color: colors.secondaryText };
    }
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
      const hours = Math.floor(diffInHours);
      return `${hours}h`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return `${days}d`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleProfilePress = (notification) => {
    const actorProfile = actorProfiles[notification.actor_id];
    const username = actorProfile?.user?.username;
    if (username) {
      router.push(`/user/${username}`);
    }
  };

  const handleNotificationPress = (notification) => {
    // For follow, follow request, and nudge notifications, go to profile
    if (notification.type === 'follow' || notification.type === 'follow_request' || notification.type === 'follow_request_accepted' || notification.type === 'nudge') {
      handleProfilePress(notification);
      return;
    }

    // For like/comment/tag/comment_like/reply notifications, go to the post
    if ((notification.type === 'like' || notification.type === 'comment' || notification.type === 'tag' || notification.type === 'comment_like' || notification.type === 'reply') && notification.post_id) {
      router.push({
        pathname: `/post/${notification.post_id}`,
        params: {
          openComments: (notification.type === 'comment' || notification.type === 'comment_like' || notification.type === 'reply') ? 'true' : 'false'
        }
      });
    }
  };

  const renderNotification = ({ item }) => {
    const actorProfile = actorProfiles[item.actor_id];
    const actorName = actorProfile?.user?.name || actorProfile?.user?.username || 'Someone';
    const avatarUrl = actorProfile?.avatarUrl;
    const icon = getNotificationIcon(item.type);
    const isFollowRequest = item.type === 'follow_request';
    const isProcessing = processingRequests[item.actor_id];

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderLight + '50' },
          !item.is_read && { backgroundColor: colors.primary + '08' },
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Avatar - tapping goes to profile */}
          <TouchableOpacity
            onPress={() => handleProfilePress(item)}
            activeOpacity={0.7}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={[styles.avatar, { backgroundColor: colors.borderLight }]}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
                  {actorName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Icon badge */}
            <View style={[styles.iconBadge, { backgroundColor: icon.color + '20', borderColor: colors.cardBackground }]}>
              <Ionicons name={icon.name} size={12} color={icon.color} />
            </View>
          </TouchableOpacity>

          {/* Text content */}
          <View style={styles.textContent}>
            <Text style={[styles.notificationText, { color: colors.text }]}>
              <Text
                style={styles.actorName}
                onPress={() => handleProfilePress(item)}
              >
                {actorName}
              </Text>
              {' '}{getNotificationText(item.type)}
            </Text>
            <Text style={[styles.timestamp, { color: colors.secondaryText }]}>{formatDate(item.created_at)}</Text>

            {/* Follow request action buttons */}
            {isFollowRequest && followRequests[item.actor_id] && (
              <View style={styles.followRequestActions}>
                <TouchableOpacity
                  style={[styles.acceptButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleAcceptFollowRequest(item.actor_id)}
                  disabled={!!isProcessing}
                >
                  {isProcessing === 'accepting' ? (
                    <ActivityIndicator size="small" color={colors.onPrimary} />
                  ) : (
                    <Text style={[styles.acceptButtonText, { color: colors.onPrimary }]}>Accept</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rejectButton, { borderColor: colors.border }]}
                  onPress={() => handleRejectFollowRequest(item.actor_id)}
                  disabled={!!isProcessing}
                >
                  {isProcessing === 'rejecting' ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <Text style={[styles.rejectButtonText, { color: colors.text }]}>Reject</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="notifications-outline"
      title="No notifications yet"
      message="When someone likes, comments, or follows you, you'll see it here."
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={notifications.length === 0 ? styles.emptyListContainer : styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  notificationItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  iconBadge: {
    position: 'absolute',
    left: 32,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  textContent: {
    flex: 1,
    marginLeft: 14,
  },
  notificationText: {
    fontSize: 15,
    lineHeight: 20,
  },
  actorName: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 13,
    marginTop: 4,
  },
  followRequestActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  acceptButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: 80,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
