import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import ModalHeader from '@/components/ui/ModalHeader';
import Avatar from '@/components/ui/Avatar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { getCommunityMembers, updateMemberRole, removeMember } from '@/services/api/communities';

const ROLE_ORDER = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
const ROLE_COLORS = { OWNER: '#FF9500', ADMIN: '#5856D6', MEMBER: null };
const ROLE_LABELS = { OWNER: 'Owner', ADMIN: 'Admin', MEMBER: 'Member' };

const CommunityMembersModal = ({ visible, onClose, communityId, userRole, onMemberChanged }) => {
  const colors = useThemeColors();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    if (visible && communityId) {
      loadMembers();
    }
  }, [visible, communityId]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await getCommunityMembers(communityId);
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserPress = useCallback((username) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    onClose();
    router.push(`/user/${username}`);
    setTimeout(() => { isNavigatingRef.current = false; }, 500);
  }, [onClose, router]);

  const handleMemberAction = (member) => {
    const isOwner = userRole === 'OWNER';
    const isAdmin = userRole === 'ADMIN';
    const memberRole = member.role;

    if (memberRole === 'OWNER') return;

    const options = [{ text: 'Cancel', style: 'cancel' }];

    if (isOwner) {
      if (memberRole === 'MEMBER') {
        options.push({ text: 'Make Admin', onPress: () => handleRoleChange(member.user.id, 'ADMIN') });
      } else if (memberRole === 'ADMIN') {
        options.push({ text: 'Remove Admin', onPress: () => handleRoleChange(member.user.id, 'MEMBER') });
      }
      options.push({
        text: 'Remove Member',
        style: 'destructive',
        onPress: () => handleRemoveMember(member.user.id, member.user.name || member.user.username),
      });
    } else if (isAdmin && memberRole === 'MEMBER') {
      options.push({
        text: 'Remove Member',
        style: 'destructive',
        onPress: () => handleRemoveMember(member.user.id, member.user.name || member.user.username),
      });
    }

    if (options.length > 1) {
      Alert.alert(member.user.name || member.user.username, null, options);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      await updateMemberRole(communityId, targetUserId, newRole);
      await loadMembers();
      onMemberChanged?.();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update role');
    }
  };

  const handleRemoveMember = (targetUserId, memberName) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from this community?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember(communityId, targetUserId);
              await loadMembers();
              onMemberChanged?.();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const canManageMember = (memberRole) => {
    if (userRole === 'OWNER' && memberRole !== 'OWNER') return true;
    if (userRole === 'ADMIN' && memberRole === 'MEMBER') return true;
    return false;
  };

  const renderMember = ({ item }) => {
    const roleColor = ROLE_COLORS[item.role];
    const canManage = canManageMember(item.role);

    return (
      <TouchableOpacity
        style={styles.memberRow}
        onPress={() => handleUserPress(item.user.username)}
        activeOpacity={0.7}
      >
        <Avatar uri={item.user.profile?.avatarUrl} name={item.user.name} size={44} />
        <View style={styles.memberInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
              {item.user.name || item.user.username}
            </Text>
            {item.user.profile?.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#1D9BF0" style={{ marginLeft: 4 }} />
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.memberUsername, { color: colors.secondaryText }]}>@{item.user.username}</Text>
            {roleColor && (
              <View style={[styles.roleBadge, { backgroundColor: roleColor + '15' }]}>
                <Text style={[styles.roleText, { color: roleColor }]}>{ROLE_LABELS[item.role]}</Text>
              </View>
            )}
          </View>
        </View>
        {canManage && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => handleMemberAction(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title="Members" onClose={onClose} />

        {isLoading ? (
          <LoadingSpinner fullScreen />
        ) : members.length > 0 ? (
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <EmptyState
            icon="people-outline"
            title="No members"
            message="This community doesn't have any members yet"
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default CommunityMembersModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  memberUsername: {
    fontSize: 13,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  moreButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
