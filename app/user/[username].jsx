import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getUserByUsername, followUser, unfollowUser } from '@/services/api/users';
import { getPostsByUserId } from '@/services/api/posts';
import { getCalendarData } from '@/services/api/dailyActivity';
import { getPublicSplitsByUserId } from '@/services/api/splits';
import { createFollowNotification, deleteFollowNotification } from '@/services/api/notifications';
import { cancelFollowRequestByTargetId } from '@/services/api/followRequests';
import { sendNudge } from '@/services/api/nudges';
import { useAuth } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PostsTab from '@/components/profile/PostsTab';
import ProgressTab from '@/components/profile/ProgressTab';
import WorkoutPlansTab from '@/components/profile/WorkoutPlansTab';
import FollowListModal from '@/components/profile/FollowListModal';
import NudgeModal from '@/components/profile/NudgeModal';
import PrivateProfilePlaceholder from '@/components/profile/PrivateProfilePlaceholder';
import TabBar from '@/components/ui/TabBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams();
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { user: currentUser, refreshProfile } = useAuth();

  const [selectedTab, setSelectedTab] = useState('Progress');
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [calendarData, setCalendarData] = useState(null);
  const [splitsData, setSplitsData] = useState(null);
  const [isHeaderLoading, setIsHeaderLoading] = useState(true);
  const [isTabDataLoading, setIsTabDataLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState('none'); // 'none' | 'following' | 'requested'
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('followers');
  const [canNudge, setCanNudge] = useState(false);
  const [nudgeModalVisible, setNudgeModalVisible] = useState(false);
  const [isNudgeLoading, setIsNudgeLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    loadUserData();
  }, [username]);

  const loadUserData = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) {
        setIsHeaderLoading(true);
        setIsTabDataLoading(true);
      }
      const userData = await getUserByUsername(username);
      setUser(userData);

      // Set follow status from API response
      if (userData?.followStatus) {
        setFollowStatus(userData.followStatus);
        setIsFollowing(userData.followStatus === 'following');

        // Enable nudge button when following (cooldown handled by API when sending)
        setCanNudge(userData.followStatus === 'following');
      } else if (currentUser?.id && userData?.followedBy) {
        // Fallback: Check if current user is following this user
        const following = userData.followedBy.some(
          (follow) => follow.followedById === currentUser.id
        );
        setIsFollowing(following);
        setFollowStatus(following ? 'following' : 'none');

        // Enable nudge button when following (cooldown handled by API when sending)
        setCanNudge(following);
      } else {
        setIsFollowing(false);
        setFollowStatus('none');
        setCanNudge(false);
      }

      // Show header NOW - don't wait for tab data
      if (showLoadingSpinner) {
        setIsHeaderLoading(false);
      }

      // Fetch all tab data IN PARALLEL in background (only if not private or if following)
      if (userData?.id) {
        const canViewContent = !userData.profile?.isPrivate || userData.followStatus === 'following';

        if (canViewContent) {
          // Load tab data in background (don't block header)
          Promise.all([
            getPostsByUserId(userData.id).catch((err) => {
              if (err?.response?.status === 403) return [];
              console.error('Error fetching posts:', err);
              return [];
            }),
            getCalendarData(userData.id).catch((err) => {
              console.error('Error fetching calendar data:', err);
              return null;
            }),
            getPublicSplitsByUserId(userData.id).catch((err) => {
              console.error('Error fetching splits:', err);
              return [];
            }),
          ]).then(([postsResult, calendarResult, splitsResult]) => {
            setPosts(postsResult);
            setCalendarData(calendarResult);
            setSplitsData(splitsResult);
            setIsTabDataLoading(false);
          });
        } else {
          setPosts([]);
          setCalendarData(null);
          setSplitsData([]);
          setIsTabDataLoading(false);
        }
      } else {
        setIsTabDataLoading(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user profile');
      setIsHeaderLoading(false);
      setIsTabDataLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser?.id) {
      Alert.alert('Error', 'You must be logged in to follow users');
      return;
    }

    try {
      setIsFollowLoading(true);

      if (followStatus === 'following') {
        // Unfollow
        await unfollowUser(username, currentUser.id);
        setIsFollowing(false);
        setFollowStatus('none');
        // Delete the follow notification
        if (user?.id) {
          await deleteFollowNotification(currentUser.id, user.id);
        }
      } else if (followStatus === 'requested') {
        // Cancel follow request
        if (user?.id) {
          await cancelFollowRequestByTargetId(user.id);
        }
        setFollowStatus('none');
      } else {
        // Follow or send request
        const result = await followUser(username, currentUser.id);

        if (result.status === 'following') {
          setIsFollowing(true);
          setFollowStatus('following');
          // Create a notification for the followed user (public account)
          if (user?.id && user.id !== currentUser.id) {
            await createFollowNotification(user.id, currentUser.id);
          }
        } else if (result.status === 'requested') {
          // Private account - request sent
          setFollowStatus('requested');
          setIsFollowing(false);
        }
      }

      // Reload user data to update follower count (without full screen loading)
      await loadUserData(false);

      // Refresh current user's profile to update following count
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', `Failed to ${followStatus === 'following' ? 'unfollow' : followStatus === 'requested' ? 'cancel request' : 'follow'} user`);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleOpenFollowersModal = () => {
    setModalType('followers');
    setModalVisible(true);
  };

  const handleOpenFollowingModal = () => {
    setModalType('following');
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleOpenNudgeModal = () => {
    setNudgeModalVisible(true);
  };

  const handleCloseNudgeModal = () => {
    setNudgeModalVisible(false);
  };

  const handleSendNudge = async (presetMessage, customMessage) => {
    if (!user?.username) return;

    setIsNudgeLoading(true);
    try {
      await sendNudge(user.username, presetMessage, customMessage);
      Alert.alert('Nudge Sent! 👈', `Your nudge was sent to ${user.name || user.username}`);
      setNudgeModalVisible(false);
      setCanNudge(false); // Disable nudge button after sending
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send nudge';
      if (error.response?.status === 429) {
        const hoursRemaining = error.response?.data?.hoursRemaining || 12;
        Alert.alert('Cooldown Active', `You can nudge this user again in ${hoursRemaining} hour${hoursRemaining === 1 ? '' : 's'}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsNudgeLoading(false);
    }
  };

  // Check if this is a private account that we can't view
  const isPrivateAndNotFollowing = user?.profile?.isPrivate && followStatus !== 'following' && !isOwnProfile;

  // Render all tabs but only show the selected one to prevent unmounting/remounting
  const renderAllTabs = () => {
    // If private and not following, show placeholder for all tabs
    if (isPrivateAndNotFollowing) {
      return <PrivateProfilePlaceholder />;
    }

    return (
      <>
        <View style={selectedTab === 'Progress' ? styles.tabVisible : styles.tabHidden}>
          <ProgressTab userId={user?.id} isViewerMode={!isOwnProfile} prefetchedCalendarData={calendarData} />
        </View>
        <View style={selectedTab === 'Posts' ? styles.tabVisible : styles.tabHidden}>
          <PostsTab posts={posts} isLoading={isTabDataLoading} currentUserId={currentUser?.id} onRefresh={loadUserData} />
        </View>
        <View style={selectedTab === 'Splits' ? styles.tabVisible : styles.tabHidden}>
          <WorkoutPlansTab userId={user?.id} isOwnProfile={isOwnProfile} prefetchedSplitsData={splitsData} />
        </View>
      </>
    );
  };

  if (isHeaderLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.secondaryText }]}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with back button */}
      <View style={[styles.headerContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow, paddingTop: 16 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || `@${username}`}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ProfileHeader
        profile={user.profile}
        username={user.username}
        name={user.name}
        bio={user.profile?.bio}
        avatarUrl={user.profile?.avatarUrl}
        followedBy={user.followerCount}
        following={user.followingCount}
        workouts={posts?.length || 0}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        followStatus={followStatus}
        isPrivate={user.profile?.isPrivate}
        isVerified={user.profile?.isVerified}
        onFollowToggle={handleFollowToggle}
        isFollowLoading={isFollowLoading}
        onFollowersPress={handleOpenFollowersModal}
        onFollowingPress={handleOpenFollowingModal}
        onNudgePress={handleOpenNudgeModal}
        canNudge={canNudge}
      />

      {/* Tabs */}
      <TabBar
        tabs={[
          { key: 'Progress', label: 'Progress' },
          { key: 'Posts', label: 'Posts' },
          { key: 'Splits', label: 'Splits' },
        ]}
        activeTab={selectedTab}
        onTabPress={setSelectedTab}
        style={{ backgroundColor: colors.cardBackground, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
      />

      {/* Tab Content */}
      <View style={[styles.tabContentContainer, { backgroundColor: colors.background }]}>
        {renderAllTabs()}
      </View>

      {/* Follow List Modal */}
      <FollowListModal
        visible={modalVisible}
        onClose={handleCloseModal}
        username={username}
        type={modalType}
      />

      {/* Nudge Modal */}
      <NudgeModal
        visible={nudgeModalVisible}
        onClose={handleCloseNudgeModal}
        onSendNudge={handleSendNudge}
        recipientName={user?.name || user?.username || 'this user'}
        isLoading={isNudgeLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 40,
  },
  tabContentContainer: {
    flex: 1,
    position: 'relative',
  },
  tabVisible: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabHidden: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    pointerEvents: 'none',
  },
});
