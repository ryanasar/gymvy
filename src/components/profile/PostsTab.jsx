import React, { useState } from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { Colors } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSync } from '@/contexts/SyncContext';
import Activity from '@/components/common/Activity';
import EmptyState from '@/components/common/EmptyState';

const ActivitiesTab = ({ posts, currentUserId, onRefresh, embedded = false, isLoading = false }) => {
  const colors = useThemeColors();
  const [localPosts, setLocalPosts] = useState(posts);
  const [refreshing, setRefreshing] = useState(false);
  const { manualSync } = useSync();

  React.useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const handlePostUpdated = (updatedPost) => {
    setLocalPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
    // Don't refresh from backend - we already have the updated post locally
  };

  const handlePostDeleted = (deletedPostId) => {
    setLocalPosts((prevPosts) => prevPosts.filter((post) => post.id !== deletedPostId));
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleRefreshPosts = async () => {
    setRefreshing(true);
    // Trigger sync on pull-to-refresh
    manualSync();
    if (onRefresh) {
      await onRefresh();
    }
    setRefreshing(false);
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <View style={[styles.skeletonContainer, { backgroundColor: colors.background }]}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.skeletonHeader, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.skeletonBody, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.skeletonBodyShort, { backgroundColor: colors.borderLight }]} />
          </View>
        ))}
      </View>
    );
  }

  if (!localPosts || localPosts.length === 0) {
    return (
      <EmptyState
        emoji="📝"
        title="No Posts yet"
        message="Start working out to see your activities here"
      />
    );
  }

  // When embedded in parent ScrollView, render without own FlatList
  if (embedded) {
    return (
      <View style={[styles.embeddedContainer, { backgroundColor: colors.background }]}>
        {localPosts.map((item) => (
          <Activity
            key={item.id.toString()}
            post={item}
            currentUserId={currentUserId}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={localPosts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Activity
          post={item}
          currentUserId={currentUserId}
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
        />
      )}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefreshPosts} tintColor={colors.primary} />
      }
      initialNumToRender={10}
      windowSize={10}
      maxToRenderPerBatch={10}
    />
  );
};

export default ActivitiesTab;

const styles = StyleSheet.create({
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  skeletonCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  skeletonHeader: {
    height: 14,
    borderRadius: 7,
    width: '40%',
    marginBottom: 12,
  },
  skeletonBody: {
    height: 12,
    borderRadius: 6,
    width: '100%',
    marginBottom: 8,
  },
  skeletonBodyShort: {
    height: 12,
    borderRadius: 6,
    width: '70%',
  },
  embeddedContainer: {
    paddingBottom: 100,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 120,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: Colors.light.borderLight + '60',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 28,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
    paddingHorizontal: 8,
  },
  listContainer: {
    paddingBottom: 100,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
});
