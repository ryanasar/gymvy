import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { useSync } from '@/contexts/SyncContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { getFollowingPosts } from '@/services/api/posts';
import Activity from '@/components/common/Activity';
import EmptyState from '@/components/common/EmptyState';
import { useThemeColors } from '@/hooks/useThemeColors';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { manualSync } = useSync();
  const { unreadCount } = useNotifications();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Ref for FlatList to enable scroll to top
  const flatListRef = useRef(null);

  // Track last refresh time for cooldown
  const lastRefreshRef = useRef(0);

  // Navigation guard to prevent double-click issues
  const isNavigatingRef = useRef(false);

  // Enable scroll to top when tapping the Home tab while already on it
  useScrollToTop(flatListRef);

  // Navigation handler with double-click protection
  const handleNavigation = useCallback((path) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    router.push(path);
    // Reset after navigation completes
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 500);
  }, [router]);

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  useEffect(() => {
    if (user?.id) {
      loadPosts();
    }
  }, [user?.id]);

  // Refresh feed when tab comes into focus (silent refresh - no loading indicator)
  // Only refresh if 30+ seconds have passed since last refresh to reduce API calls
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        const now = Date.now();
        if (now - lastRefreshRef.current > 30000) {
          loadPosts(true, true);
          lastRefreshRef.current = now;
        }
      }
    }, [user?.id])
  );

  const loadPosts = async (refresh = false, silent = false) => {
    if (!user?.id) return;

    try {
      if (refresh && !silent) {
        setRefreshing(true);
      } else if (!refresh) {
        setIsLoading(true);
      }

      const response = await getFollowingPosts(user.id, null, 10);
      setPosts(response.posts || []);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading following posts:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const loadMorePosts = async () => {
    if (!user?.id || !hasMore || isLoadingMore || !nextCursor) return;

    try {
      setIsLoadingMore(true);
      const response = await getFollowingPosts(user.id, nextCursor, 10);
      setPosts(prevPosts => [...prevPosts, ...(response.posts || [])]);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    // Trigger sync on pull-to-refresh
    manualSync();
    await loadPosts(true);
  };

  const handlePostUpdated = (updatedPost) => {
    // Update post in local state instead of reloading from backend
    setPosts(prevPosts =>
      prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  };

  const handlePostDeleted = () => {
    loadPosts(true);
  };

  const renderEmptyComponent = () => (
    <EmptyState
      emoji="💪"
      title="No new workouts yet"
      message="Go lift or hype a friend!"
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.title, { color: colors.text }]}>Home</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => handleNavigation('/search')}
              style={styles.notificationButton}
              disabled={isNavigatingRef.current}
            >
              <Ionicons name="search-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleNavigation('/notifications')}
              style={styles.notificationButton}
              disabled={isNavigatingRef.current}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              {unreadCount > 0 && (
                <View style={[styles.notificationBadge, { borderColor: colors.cardBackground }]}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.headerContainer, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity onPress={scrollToTop} activeOpacity={0.7}>
          <Text style={[styles.title, { color: colors.text }]}>Home</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => handleNavigation('/search')}
            style={styles.notificationButton}
            disabled={isNavigatingRef.current}
          >
            <Ionicons name="search-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleNavigation('/notifications')}
            style={styles.notificationButton}
            disabled={isNavigatingRef.current}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={[styles.notificationBadge, { borderColor: colors.cardBackground }]}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={({ item }) => (
          <Activity
            post={item}
            currentUserId={user?.id}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        contentContainerStyle={posts.length === 0 ? styles.emptyListContainer : styles.listContainer}
        initialNumToRender={10}
        windowSize={10}
        maxToRenderPerBatch={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 6,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  listContainer: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 24,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
