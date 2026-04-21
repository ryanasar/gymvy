import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getCommunityFeed } from '@/services/api/communities';
import Activity from '@/components/common/Activity';
import EmptyState from '@/components/common/EmptyState';

const CommunityFeedView = ({ communityId, currentUserId }) => {
  const colors = useThemeColors();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (communityId) {
      loadPosts();
    }
  }, [communityId]);

  const loadPosts = async (refresh = false, silent = false) => {
    if (!communityId) return;

    try {
      if (refresh && !silent) {
        setRefreshing(true);
      } else if (!refresh) {
        setIsLoading(true);
      }

      const response = await getCommunityFeed(communityId, null, 10);
      setPosts(response.posts || []);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading community feed:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const loadMorePosts = async () => {
    if (!communityId || !hasMore || isLoadingMore || !nextCursor) return;

    try {
      setIsLoadingMore(true);
      const response = await getCommunityFeed(communityId, nextCursor, 10);
      setPosts(prev => [...prev, ...(response.posts || [])]);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading more community posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    await loadPosts(true);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handlePostDeleted = () => {
    loadPosts(true, true);
  };

  const renderEmpty = () => (
    <EmptyState
      icon="newspaper-outline"
      title="No posts yet"
      message="Share a workout to this community!"
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <Activity
          post={item}
          currentUserId={currentUserId}
          onPostUpdated={handlePostUpdated}
          onPostDeleted={handlePostDeleted}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={loadMorePosts}
      onEndReachedThreshold={0.5}
      contentContainerStyle={posts.length === 0 ? styles.emptyContainer : styles.listContainer}
    />
  );
};

export default CommunityFeedView;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  listContainer: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
