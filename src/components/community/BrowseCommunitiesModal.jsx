import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import ModalHeader from '@/components/ui/ModalHeader';
import { searchCommunities, joinCommunityByCode } from '@/services/api/communities';

const BrowseCommunitiesModal = ({ visible, onClose, onJoined, userCommunityIds = [] }) => {
  const colors = useThemeColors();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setQuery('');
      setResults([]);
      setIsSearching(false);
      setHasSearched(false);
      setJoiningId(null);
    }
  }, [visible]);

  const performSearch = useCallback(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    try {
      const data = await searchCommunities(searchQuery);
      setResults(data);
      setHasSearched(true);
    } catch {
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < 2) {
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(() => performSearch(text), 400);
  };

  const handleClearQuery = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setIsSearching(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleJoin = async (community) => {
    if (joiningId) return;
    setJoiningId(community.id);
    try {
      await joinCommunityByCode(community.inviteCode);
      onJoined?.();
      onClose();
      router.push(`/community/${community.id}`);
    } catch (err) {
      if (err.response?.status === 409) {
        Alert.alert(
          'Already a Member',
          'You are already a member of this community.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Go to Community',
              onPress: () => {
                onClose();
                router.push(`/community/${community.id}`);
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', err.response?.data?.error || 'Failed to join community');
      }
    } finally {
      setJoiningId(null);
    }
  };

  const renderItem = ({ item }) => {
    const isMember = userCommunityIds.includes(item.id);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={isMember ? () => { onClose(); router.push(`/community/${item.id}`); } : undefined}
        disabled={!isMember}
        style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}
      >
        <View style={styles.row}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.borderLight }]}>
              <Ionicons name="people" size={24} color={colors.secondaryText} style={{ opacity: 0.6 }} />
            </View>
          )}

          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.memberCount, { color: colors.secondaryText }]}>
              {item._count?.members || 0} {(item._count?.members || 0) === 1 ? 'member' : 'members'}
            </Text>
          </View>

          {isMember ? (
            <View style={[styles.joinedBadge, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={[styles.joinedText, { color: colors.primary }]}>Joined</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.joinButton, { backgroundColor: colors.primary }]}
              onPress={() => handleJoin(item)}
              disabled={joiningId === item.id}
              activeOpacity={0.7}
            >
              {joiningId === item.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.joinButtonText}>Join</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (isSearching) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (hasSearched) {
      return (
        <View style={styles.centeredState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.border + '20' }]}>
            <Ionicons name="search-outline" size={40} color={colors.secondaryText} style={{ opacity: 0.5 }} />
          </View>
          <Text style={[styles.stateTitle, { color: colors.text }]}>No communities found</Text>
          <Text style={[styles.stateMessage, { color: colors.secondaryText }]}>
            Try a different search term
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.centeredState}>
        <View style={[styles.emptyIconContainer, { backgroundColor: colors.border + '20' }]}>
          <Ionicons name="globe-outline" size={40} color={colors.secondaryText} style={{ opacity: 0.5 }} />
        </View>
        <Text style={[styles.stateTitle, { color: colors.text }]}>Discover Communities</Text>
        <Text style={[styles.stateMessage, { color: colors.secondaryText }]}>
          Search for public communities to join
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
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ModalHeader title="Browse Communities" onClose={onClose} />

        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="search-outline" size={20} color={colors.secondaryText} style={{ opacity: 0.6 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search communities..."
              placeholderTextColor={colors.placeholder}
              value={query}
              onChangeText={handleQueryChange}
              autoCorrect={false}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClearQuery} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={20} color={colors.secondaryText} style={{ opacity: 0.5 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={results.length === 0 ? styles.emptyContainer : styles.listContainer}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BrowseCommunitiesModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    padding: 0,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    borderRadius: 20,
    borderWidth: 0,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  memberCount: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.6,
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinedText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  centeredState: {
    alignItems: 'center',
    gap: 12,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  stateMessage: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
