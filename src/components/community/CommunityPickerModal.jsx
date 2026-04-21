import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

const CommunityPickerModal = ({ visible, onClose, selectedCommunities = [], onCommunitiesSelected, communities = [] }) => {
  const colors = useThemeColors();
  const [localSelected, setLocalSelected] = useState(selectedCommunities);

  useEffect(() => {
    if (visible) {
      setLocalSelected(selectedCommunities);
    }
  }, [visible]);

  const isSelected = (communityId) => {
    return localSelected.some(c => c.id === communityId);
  };

  const handleToggle = (community) => {
    setLocalSelected(prev => {
      const exists = prev.some(c => c.id === community.id);
      if (exists) {
        return prev.filter(c => c.id !== community.id);
      }
      return [...prev, {
        id: community.id,
        name: community.name,
        color: community.color,
        imageUrl: community.imageUrl,
        _count: community._count,
        role: community.members?.[0]?.role,
      }];
    });
  };

  const handleDone = () => {
    onCommunitiesSelected(localSelected);
    onClose();
  };

  const renderSelectedChips = () => {
    if (localSelected.length === 0) return null;

    return (
      <View style={[styles.selectedContainer, { borderBottomColor: colors.borderLight }]}>
        <FlatList
          horizontal
          data={localSelected}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectedList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.selectedChip, { backgroundColor: (item.color || colors.primary) + '15' }]}
              onPress={() => handleToggle(item)}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.chipImage} contentFit="cover" />
              ) : (
                <View style={[styles.chipImagePlaceholder, { backgroundColor: item.color || colors.primary }]}>
                  <Ionicons name="people" size={10} color="#fff" />
                </View>
              )}
              <Text style={[styles.selectedChipText, { color: item.color || colors.primary }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Ionicons name="close" size={14} color={item.color || colors.primary} />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderCommunity = ({ item }) => {
    const selected = isSelected(item.id);
    const memberRole = item.members?.[0]?.role;

    return (
      <TouchableOpacity
        style={[
          styles.communityItem,
          { backgroundColor: colors.cardBackground },
          selected && { backgroundColor: colors.primary + '10' },
        ]}
        onPress={() => handleToggle(item)}
        activeOpacity={0.7}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.communityImage} contentFit="cover" />
        ) : (
          <View style={[styles.communityImagePlaceholder, { backgroundColor: item.color || colors.primary }]}>
            <Ionicons name="people" size={18} color="#fff" />
          </View>
        )}

        <View style={styles.communityInfo}>
          <Text style={[styles.communityName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.communityMeta}>
            <Text style={[styles.memberCount, { color: colors.secondaryText }]}>
              {item._count?.members || 0} members
            </Text>
            {memberRole && memberRole !== 'MEMBER' && (
              <View style={[styles.roleBadge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.roleText, { color: colors.primary }]}>
                  {memberRole.charAt(0) + memberRole.slice(1).toLowerCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={[
          styles.checkbox,
          { borderColor: selected ? colors.primary : colors.border },
          selected && { backgroundColor: colors.primary },
        ]}>
          {selected && (
            <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={48} color={colors.secondaryText + '50'} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No communities yet
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
          Join or create a community to share your posts
        </Text>
      </View>
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
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.cancelText, { color: colors.secondaryText }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Share To</Text>
          <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
            <Text style={[styles.doneText, { color: colors.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Chips */}
        {renderSelectedChips()}

        {/* Community List */}
        {communities.length > 0 ? (
          <FlatList
            data={communities}
            renderItem={renderCommunity}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmpty()
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeButton: {
    minWidth: 60,
  },
  cancelText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  doneButton: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedContainer: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  selectedList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 8,
    gap: 6,
    marginRight: 8,
  },
  chipImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  chipImagePlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedChipText: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 120,
  },
  listContent: {
    paddingVertical: 8,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  communityImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 14,
  },
  communityImagePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  communityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberCount: {
    fontSize: 14,
  },
  roleBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CommunityPickerModal;
