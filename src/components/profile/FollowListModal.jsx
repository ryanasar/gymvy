import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  FlatList,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getFollowers, getFollowing } from '@/services/api/users';
import EmptyState from '@/components/common/EmptyState';
import ModalHeader from '@/components/ui/ModalHeader';
import UserListItem from '@/components/ui/UserListItem';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const FollowListModal = ({ visible, onClose, username, type }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colors = useThemeColors();

  // Navigation guard to prevent double-click issues
  const isNavigatingRef = useRef(false);
  // Mounted ref to prevent setState after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (visible && username) {
      loadUsers();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [visible, username, type]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = type === 'followers'
        ? await getFollowers(username)
        : await getFollowing(username);
      if (isMountedRef.current) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleUserPress = useCallback((userUsername) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    onClose();
    router.push(`/user/${userUsername}`);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 500);
  }, [onClose, router]);

  const renderUser = ({ item }) => (
    <UserListItem
      user={{
        name: item.name,
        username: item.username,
        avatarUrl: item.profile?.avatarUrl,
        isVerified: item.profile?.isVerified,
        bio: item.profile?.bio,
      }}
      onPress={() => handleUserPress(item.username)}
      rightAction={
        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
      }
    />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ModalHeader
          title={type === 'followers' ? 'Followers' : 'Following'}
          onClose={onClose}
        />

        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : users.length > 0 ? (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item, index) => item?.id?.toString() || `user-${index}`}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <EmptyState
            icon="people-outline"
            title={type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            message={type === 'followers' ? 'When someone follows this user, they will appear here' : 'Users this person follows will appear here'}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
});

export default FollowListModal;
