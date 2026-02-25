import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useThemeColors } from '@/hooks/useThemeColors';
import { searchUsers, followUser, unfollowUser } from '@/services/api/users';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '@/components/ui/Avatar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';

export default function FindFriends() {
  const router = useRouter();
  const { user } = useAuth();
  const colors = useThemeColors();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [followStates, setFollowStates] = useState({});

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslate = useSharedValue(20);
  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(30);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    headerTranslate.value = withDelay(100, withSpring(0, { damping: 15 }));
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    contentTranslate.value = withDelay(300, withSpring(0, { damping: 15 }));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslate.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQuery, user?.id);
          setSearchResults(results || []);
          // Initialize follow states from results
          const states = {};
          (results || []).forEach((u) => {
            states[u.id] = u.isFollowing ? 'following' : (u.isRequested ? 'requested' : 'none');
          });
          setFollowStates((prev) => ({ ...prev, ...states }));
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, user?.id]);

  const handleFollow = useCallback(async (targetUser) => {
    const currentState = followStates[targetUser.id] || 'none';
    if (currentState === 'loading') return;

    setFollowStates((prev) => ({ ...prev, [targetUser.id]: 'loading' }));

    try {
      if (currentState === 'following' || currentState === 'requested') {
        await unfollowUser(targetUser.username, user?.id);
        setFollowStates((prev) => ({ ...prev, [targetUser.id]: 'none' }));
      } else {
        const result = await followUser(targetUser.username, user?.id);
        const newState = result?.status === 'requested' ? 'requested' : 'following';
        setFollowStates((prev) => ({ ...prev, [targetUser.id]: newState }));
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
      setFollowStates((prev) => ({ ...prev, [targetUser.id]: currentState }));
    }
  }, [followStates, user?.id]);

  const steps = [1, 2, 3, 4];

  const getFollowButtonStyle = (state) => {
    if (state === 'following' || state === 'requested') {
      return [styles.followButton, styles.followButtonOutline, { borderColor: colors.border }];
    }
    return [styles.followButton, { backgroundColor: colors.primary }];
  };

  const getFollowButtonText = (state) => {
    if (state === 'loading') return null;
    if (state === 'following') return 'Following';
    if (state === 'requested') return 'Requested';
    return 'Follow';
  };

  const renderUserItem = ({ item }) => {
    const state = followStates[item.id] || 'none';

    return (
      <View style={[styles.userItem, { borderBottomColor: colors.borderLight }]}>
        <Avatar
          uri={item.profilePicUrl}
          name={item.name}
          size={44}
        />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.userUsername, { color: colors.secondaryText }]} numberOfLines={1}>
            @{item.username}
          </Text>
        </View>
        <TouchableOpacity
          style={getFollowButtonStyle(state)}
          onPress={() => handleFollow(item)}
          activeOpacity={0.7}
          disabled={state === 'loading'}
        >
          {state === 'loading' ? (
            <ActivityIndicator size="small" color={state === 'following' ? colors.text : colors.onPrimary} />
          ) : (
            <Text
              style={[
                styles.followButtonText,
                { color: (state === 'following' || state === 'requested') ? colors.text : colors.onPrimary },
              ]}
            >
              {getFollowButtonText(state)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isSearching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (searchQuery.trim() && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={colors.secondaryText} style={{ opacity: 0.5 }} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No users found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
            Try a different name or username
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={48} color={colors.secondaryText} style={{ opacity: 0.5 }} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Search for friends</Text>
        <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
          Find friends by name or username
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="people-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Find Friends</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Follow people to see their workouts
          </Text>
        </Animated.View>

        {/* Step indicators */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={step} style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: index <= 2 ? colors.primary : colors.borderLight,
                    borderColor: index <= 2 ? colors.primary : colors.border,
                  },
                ]}
              >
                {index < 2 && (
                  <Ionicons name="checkmark" size={10} color={colors.onPrimary} />
                )}
                {index === 2 && (
                  <View style={[styles.stepDotInner, { backgroundColor: colors.onPrimary }]} />
                )}
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: index < 2 ? colors.primary : colors.borderLight },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        <Animated.View style={[styles.searchSection, contentAnimatedStyle]}>
          <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={18} color={colors.secondaryText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by name or username..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.secondaryText} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.resultsList}
          contentContainerStyle={searchResults.length === 0 ? styles.emptyListContent : styles.listContent}
          ListEmptyComponent={renderEmptyState}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.borderLight }]}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(onboarding)/complete')}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
              {Object.values(followStates).some(s => s === 'following' || s === 'requested') ? 'Continue' : 'Skip'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  resultsList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  emptyListContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    fontWeight: '500',
  },
  followButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: 1,
  },
  primaryButton: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontWeight: '700',
    fontSize: 17,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 6,
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 17,
  },
});
