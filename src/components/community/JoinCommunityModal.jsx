import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import ModalHeader from '@/components/ui/ModalHeader';
import { joinCommunityByCode } from '@/services/api/communities';

const JoinCommunityModal = ({ visible, onClose, onCommunityJoined }) => {
  const colors = useThemeColors();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setCode('');
      setError('');
    }
  }, [visible]);

  const handleCodeChange = (text) => {
    setCode(text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8));
    setError('');
  };

  const handleJoin = async () => {
    if (code.length !== 8 || isJoining) return;
    setIsJoining(true);
    setError('');

    try {
      const result = await joinCommunityByCode(code);
      onCommunityJoined?.(result);
      onClose();
      router.push(`/community/${result.communityId}`);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to join community';
      setError(message);
    } finally {
      setIsJoining(false);
    }
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
        <ModalHeader title="Join Community" onClose={onClose} />

        <View style={styles.content}>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Enter the 8-character invite code to join a community
          </Text>

          <TextInput
            style={[
              styles.codeInput,
              {
                backgroundColor: colors.cardBackground,
                borderColor: error ? colors.error : colors.borderLight,
                color: colors.text,
              },
            ]}
            placeholder="XXXXXXXX"
            placeholderTextColor={colors.placeholder}
            value={code}
            onChangeText={handleCodeChange}
            maxLength={8}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
          />

          {error ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.joinButton,
              { backgroundColor: colors.primary },
              (code.length !== 8 || isJoining) && { opacity: 0.5 },
            ]}
            onPress={handleJoin}
            disabled={code.length !== 8 || isJoining}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>Join Community</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default JoinCommunityModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  codeInput: {
    width: '100%',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 6,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  errorText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  joinButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
