import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/lib/auth';
import { useWorkout } from '@/contexts/WorkoutContext';
import { usePreload } from '@/contexts/PreloadContext';
import { useSync } from '@/contexts/SyncContext';
import ActivitiesTab from '@/components/profile/PostsTab';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProgressTab from '@/components/profile/ProgressTab';
import WorkoutPlansTab from '@/components/profile/WorkoutPlansTab';
import FollowListModal from '@/components/profile/FollowListModal';
import EditProfileModal from '@/components/profile/EditProfileModal';
import BlockedUsersModal from '@/components/profile/BlockedUsersModal';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useWeightUnit } from '@/hooks/useWeightUnit';
import { deleteProfile } from '@/services/api/profile';
import TabBar from '@/components/ui/TabBar';

const ProfileScreen = () => {
  const colors = useThemeColors();
  const { contentMaxWidth } = useResponsiveLayout();
  const responsiveStyle = contentMaxWidth
    ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }
    : undefined;
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('Progress');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('followers');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [blockedUsersModalVisible, setBlockedUsersModalVisible] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const { user, profile, posts, signOut, refreshPosts, refreshProfile } = useAuth();
  const { lastWorkoutCompleted } = useWorkout();
  const { refreshCalendar, refreshSplits, refreshCommunities, communities } = usePreload();
  const { manualSync } = useSync();
  const { weightUnit, setWeightUnit } = useWeightUnit();
  const [refreshing, setRefreshing] = useState(false);

  // Force ProgressTab to refresh when workout completion changes
  useEffect(() => {
    if (lastWorkoutCompleted) {
      setProgressKey(prev => prev + 1);
    }
  }, [lastWorkoutCompleted]);

  // Refresh posts when tab comes into focus to sync like states
  useFocusEffect(
    useCallback(() => {
      if (user?.id && posts?.length > 0) {
        refreshPosts();
      }
    }, [user?.id])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshProfile(),
        refreshPosts(),
        refreshCalendar(),
        refreshSplits(),
        manualSync(),
        refreshCommunities(),
      ]);
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile, refreshPosts, refreshCalendar, refreshSplits, manualSync, refreshCommunities]);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>User not found.</Text>
      </View>
    );
  }

  const username = user.username;
  const name = user.name;
  const bio = profile?.bio;
  const avatarUrl = profile?.avatarUrl;
  const followedBy = profile?.user?._count?.followedBy;
  const following = profile?.user?._count?.following;
  const postsCount = posts?.length || 0;
  const isOwnProfile = true;
  const isFollowing = false;
  const isPrivate = profile?.isPrivate;
  const isVerified = profile?.isVerified;

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

  const handleOpenEditModal = () => {
    setEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
  };

  const handleProfileUpdated = (updatedProfile) => {
    // Refresh the profile data
    if (refreshProfile) {
      refreshProfile();
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteProfile(user.id);
    } catch (error) {
      // Only re-throw if we got an actual error response that isn't 401.
      // Network errors (no response) mean the deletion likely succeeded
      // but the connection dropped after the session was invalidated.
      if (error.response && error.response.status !== 401) {
        throw error;
      }
    }
    await signOut();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed "Profile" title header */}
      <View style={[styles.headerContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={responsiveStyle}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.text} />
        }
      >
        <ProfileHeader
          profile={profile}
          username={username}
          name={name}
          bio={bio}
          avatarUrl={avatarUrl}
          followedBy={followedBy}
          following={following}
          workouts={postsCount}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          isPrivate={isPrivate}
          isVerified={isVerified}
          onSignOut={signOut}
          onDeleteAccount={handleDeleteAccount}
          onBlockedUsersPress={() => setBlockedUsersModalVisible(true)}
          weightUnit={weightUnit}
          onWeightUnitChange={setWeightUnit}
          onFollowersPress={handleOpenFollowersModal}
          onFollowingPress={handleOpenFollowingModal}
          onEditPress={handleOpenEditModal}
          communities={communities}
        />

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

        {selectedTab === 'Progress' && (
          <ProgressTab userId={user.id} key={progressKey} embedded />
        )}
        {selectedTab === 'Posts' && (
          <ActivitiesTab posts={posts} currentUserId={user.id} onRefresh={refreshPosts} embedded />
        )}
        {selectedTab === 'Splits' && (
          <WorkoutPlansTab userId={user.id} embedded />
        )}
      </ScrollView>

      {/* Follow List Modal */}
      <FollowListModal
        visible={modalVisible}
        onClose={handleCloseModal}
        username={username}
        type={modalType}
      />

      {/* Blocked Users Modal */}
      <BlockedUsersModal
        visible={blockedUsersModalVisible}
        onClose={() => setBlockedUsersModalVisible(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={handleCloseEditModal}
        userId={user?.id}
        currentBio={bio}
        currentAvatarUrl={avatarUrl}
        currentIsPrivate={isPrivate}
        userName={name}
        currentName={name}
        onProfileUpdated={handleProfileUpdated}
      />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
