import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import ModalHeader from '@/components/ui/ModalHeader';
import { regenerateInviteCode } from '@/services/api/communities';

const InviteShareSheet = ({ visible, onClose, inviteCode, communityName, isAdmin, communityId, onCodeRegenerated }) => {
  const colors = useThemeColors();

  const handleCopy = async () => {
    await Share.share({ message: inviteCode });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my community "${communityName}" on Gymvy! Code: ${inviteCode}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRegenerate = () => {
    Alert.alert(
      'Regenerate Code',
      'This will invalidate the current invite code. Anyone with the old code won\'t be able to join. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await regenerateInviteCode(communityId);
              onCodeRegenerated?.(result.inviteCode);
              Alert.alert('Done', 'New invite code generated');
            } catch (error) {
              Alert.alert('Error', 'Failed to regenerate invite code');
            }
          },
        },
      ]
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
        <ModalHeader title="Invite" onClose={onClose} />

        <View style={styles.content}>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Share this code with people you want to invite
          </Text>

          <View style={[styles.codeContainer, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight }]}>
            <Text style={[styles.codeText, { color: colors.text }]}>{inviteCode}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleCopy}
            >
              <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Copy Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={20} color={colors.text} />
              <Text style={[styles.actionButtonTextSecondary, { color: colors.text }]}>Share</Text>
            </TouchableOpacity>
          </View>

          {isAdmin && (
            <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerate}>
              <Ionicons name="refresh-outline" size={18} color={colors.error} />
              <Text style={[styles.regenerateText, { color: colors.error }]}>Regenerate Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default InviteShareSheet;

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
  codeContainer: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 6,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 32,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  regenerateText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
