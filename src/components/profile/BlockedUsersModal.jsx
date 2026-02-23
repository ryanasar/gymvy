import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getBlockedUsers, unblockUser } from '@/services/api/blocks';
import Avatar from '@/components/ui/Avatar';
import ModalHeader from '@/components/ui/ModalHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';

const BlockedUsersModal = ({ visible, onClose }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const colors = useThemeColors();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (visible) {
      loadBlockedUsers();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [visible]);

  const loadBlockedUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getBlockedUsers();
      if (isMountedRef.current) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading blocked users:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleUnblock = (user) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${user.name || user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              await unblockUser(user.id);
              setUsers(prev => prev.filter(u => u.id !== user.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to unblock user');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.userRow, { borderBottomColor: colors.borderLight }]}>
      <Avatar
        uri={item.profile?.avatarUrl}
        name={item.name || item.username}
        size={44}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.username}
        </Text>
        <Text style={[styles.username, { color: colors.secondaryText }]} numberOfLines={1}>
          @{item.username}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.unblockButton, { borderColor: colors.border }]}
        onPress={() => handleUnblock(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.unblockText, { color: colors.text }]}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title="Blocked Users" onClose={onClose} />
        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <EmptyState
                icon="people-outline"
                title="No blocked users"
                subtitle="Users you block will appear here"
              />
            }
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
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    fontSize: 14,
    marginTop: 2,
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  unblockText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BlockedUsersModal;
