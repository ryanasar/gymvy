import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import CommunityMembersModal from '@/components/community/CommunityMembersModal';
import InviteShareSheet from '@/components/community/InviteShareSheet';
import CreateCommunityModal from '@/components/community/CreateCommunityModal';
import CommunityFeedView from '@/components/community/CommunityFeedView';
import { getCommunityById, leaveCommunity, deleteCommunity } from '@/services/api/communities';

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [inviteSheetVisible, setInviteSheetVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const userRole = community?.members?.find(m => m.userId === user?.id)?.role;
  const isOwner = userRole === 'OWNER';
  const isAdmin = userRole === 'OWNER' || userRole === 'ADMIN';

  useEffect(() => {
    loadCommunity();
  }, [id]);

  const loadCommunity = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const data = await getCommunityById(parseInt(id));
      setCommunity(data);
    } catch (error) {
      console.error('Error loading community:', error);
      if (showLoading) {
        Alert.alert('Error', 'Failed to load community');
        router.back();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Community',
      `Are you sure you want to leave "${community.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveCommunity(community.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to leave community');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Community',
      `Are you sure you want to delete "${community.name}"? All posts and members will be removed. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Deletion',
              `Type "${community.name}" to confirm.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async (input) => {
                    if (input?.trim() !== community.name) {
                      Alert.alert('Name does not match', 'Community was not deleted.');
                      return;
                    }
                    try {
                      await deleteCommunity(community.id);
                      router.back();
                    } catch (error) {
                      Alert.alert('Error', error.response?.data?.error || 'Failed to delete community');
                    }
                  },
                },
              ],
              'plain-text',
              '',
              'default'
            );
          },
        },
      ]
    );
  };

  const handleCodeRegenerated = (newCode) => {
    setCommunity(prev => ({ ...prev, inviteCode: newCode }));
  };

  const handleCommunityUpdated = () => {
    loadCommunity(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (!community) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.secondaryText }]}>Community not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.headerContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow, paddingTop: 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        {userRole ? (
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      {/* Community Header Card */}
      <View style={[styles.communityCard, { backgroundColor: colors.cardBackground }]}>
        {/* Community Image + Info */}
        <View style={styles.communityHeader}>
          {community.imageUrl ? (
            <Image source={{ uri: community.imageUrl }} style={styles.communityImage} contentFit="cover" />
          ) : (
            <View style={[styles.communityImagePlaceholder, { backgroundColor: colors.borderLight }]}>
              <Ionicons name="people" size={32} color={colors.secondaryText} />
            </View>
          )}
          <View style={styles.communityInfo}>
            <Text style={[styles.communityName, { color: colors.text }]}>{community.name}</Text>
            <Text style={[styles.memberCount, { color: colors.secondaryText }]}>
              {community._count?.members || 0} {community._count?.members === 1 ? 'member' : 'members'}
            </Text>
            <View style={styles.visibilityRow}>
              <Ionicons
                name={community.visibility === 'PUBLIC' ? 'globe-outline' : 'lock-closed-outline'}
                size={13}
                color={colors.secondaryText}
              />
              <Text style={[styles.visibilityText, { color: colors.secondaryText }]}>
                {community.visibility === 'PUBLIC' ? 'Public' : 'Private'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {community.description ? (
          <Text style={[styles.description, { color: colors.text }]}>{community.description}</Text>
        ) : null}

        {/* Tags */}
        {community.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {community.tags.map((tag, i) => (
              <Badge key={i} label={tag} size="sm" color={colors.primary} />
            ))}
          </View>
        )}

        {/* School/Location */}
        {(community.school || community.city) && (
          <View style={styles.locationRow}>
            {community.school && (
              <View style={styles.locationItem}>
                <Ionicons name="school-outline" size={14} color={colors.secondaryText} />
                <Text style={[styles.locationText, { color: colors.secondaryText }]}>{community.school}</Text>
              </View>
            )}
            {community.city && (
              <View style={styles.locationItem}>
                <Ionicons name="location-outline" size={14} color={colors.secondaryText} />
                <Text style={[styles.locationText, { color: colors.secondaryText }]}>
                  {community.city}{community.state ? `, ${community.state}` : ''}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionsContainer, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '12' }]} onPress={() => setInviteSheetVisible(true)}>
          <Ionicons name="person-add-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.primary }]}>Invite</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '12' }]} onPress={() => setMembersModalVisible(true)}>
          <Ionicons name="people-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.primary }]}>Members</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '12' }]} onPress={() => setEditModalVisible(true)}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Community Feed */}
      <View style={{ flex: 1 }}>
        <CommunityFeedView communityId={community.id} currentUserId={user?.id} />
      </View>

      {/* Modals */}
      <CommunityMembersModal
        visible={membersModalVisible}
        onClose={() => setMembersModalVisible(false)}
        communityId={community.id}
        userRole={userRole}
        onMemberChanged={() => loadCommunity(false)}
      />

      <InviteShareSheet
        visible={inviteSheetVisible}
        onClose={() => setInviteSheetVisible(false)}
        inviteCode={community.inviteCode}
        communityName={community.name}
        isAdmin={isAdmin}
        communityId={community.id}
        onCodeRegenerated={handleCodeRegenerated}
      />

      <CreateCommunityModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onCommunityCreated={handleCommunityUpdated}
        editMode
        community={community}
      />

      {/* Overflow Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuDropdown, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
            {userRole && !isOwner && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setMenuVisible(false); handleLeave(); }}
                activeOpacity={0.7}
              >
                <Ionicons name="exit-outline" size={20} color={colors.error} />
                <Text style={[styles.menuItemText, { color: colors.error }]}>Leave Community</Text>
              </TouchableOpacity>
            )}
            {isOwner && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setMenuVisible(false); handleDelete(); }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <Text style={[styles.menuItemText, { color: colors.error }]}>Delete Community</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  communityCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  communityImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityInfo: {
    flex: 1,
    marginLeft: 14,
  },
  communityName: {
    fontSize: 22,
    fontWeight: '700',
  },
  memberCount: {
    fontSize: 14,
    marginTop: 2,
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  visibilityText: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
    opacity: 0.85,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  locationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
    marginTop: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 20,
  },
  menuDropdown: {
    borderRadius: 16,
    paddingVertical: 8,
    minWidth: 200,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
