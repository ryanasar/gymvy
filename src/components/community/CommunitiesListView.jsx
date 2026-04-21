import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import CommunityListItem from './CommunityListItem';
import CreateCommunityModal from './CreateCommunityModal';
import JoinCommunityModal from './JoinCommunityModal';
import BrowseCommunitiesModal from './BrowseCommunitiesModal';
import EmptyState from '@/components/common/EmptyState';

const CommunitiesListView = ({ communities, isLoading, onRefresh, refreshing, listRef }) => {
  const colors = useThemeColors();
  const router = useRouter();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [browseModalVisible, setBrowseModalVisible] = useState(false);

  const handleCommunityPress = (community) => {
    router.push(`/community/${community.id}`);
  };

  const handleCommunityCreated = () => {
    setCreateModalVisible(false);
    onRefresh?.();
  };

  const handleCommunityJoined = () => {
    setJoinModalVisible(false);
    onRefresh?.();
  };

  const handleBrowseJoined = () => {
    setBrowseModalVisible(false);
    onRefresh?.();
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <TouchableOpacity
        style={[styles.headerButton, { backgroundColor: colors.primary + '15' }]}
        onPress={() => setBrowseModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="search-outline" size={20} color={colors.primary} />
        <Text style={[styles.headerButtonText, { color: colors.primary }]}>Browse</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.headerButton, { backgroundColor: colors.primary + '15' }]}
        onPress={() => setJoinModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="key-outline" size={20} color={colors.primary} />
        <Text style={[styles.headerButtonText, { color: colors.primary }]}>Join</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.headerButton, { backgroundColor: colors.primary + '15' }]}
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={[styles.headerButtonText, { color: colors.primary }]}>Create</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      icon="people-outline"
      title="No communities yet"
      message="You're not in any communities yet. Create one, join with an invite code, or browse public communities!"
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={communities}
        renderItem={({ item }) => (
          <CommunityListItem community={item} onPress={handleCommunityPress} />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={communities.length === 0 ? styles.emptyContainer : styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />

      <CreateCommunityModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCommunityCreated={handleCommunityCreated}
      />

      <JoinCommunityModal
        visible={joinModalVisible}
        onClose={() => setJoinModalVisible(false)}
        onJoined={handleCommunityJoined}
      />

      <BrowseCommunitiesModal
        visible={browseModalVisible}
        onClose={() => setBrowseModalVisible(false)}
        onJoined={handleBrowseJoined}
        userCommunityIds={communities.map(c => c.id)}
      />
    </View>
  );
};

export default CommunitiesListView;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  headerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  listContainer: {
    paddingHorizontal: 6,
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    paddingHorizontal: 6,
  },
});
