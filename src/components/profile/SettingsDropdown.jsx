import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Radius, Spacing, FontSize, FontWeight, Shadows } from '@/constants/theme';

const SettingsDropdown = ({ onSignOut, onDeleteAccount, onBlockedUsersPress, weightUnit, onWeightUnitChange }) => {
  const colors = useThemeColors();
  const [isVisible, setIsVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  // Synchronous ref guard to prevent double-tap on delete
  const isDeletingRef = useRef(false);

  const handleSignOut = () => {
    setIsVisible(false);
    onSignOut();
  };

  const handleDeletePress = () => {
    setIsVisible(false);
    setShowDeleteModal(true);
  };

  const handlePrivacyPolicy = async () => {
    setIsVisible(false);
    try {
      await Linking.openURL('https://ryanasar.github.io/gymvy-site/privacy.html');
    } catch {
      Alert.alert('Error', 'Unable to open link');
    }
  };

  const handleBlockedUsers = () => {
    setIsVisible(false);
    onBlockedUsersPress?.();
  };

  const handleConfirmDelete = async () => {
    if (deleteText !== 'DELETE') return;
    if (isDeletingRef.current) return;
    isDeletingRef.current = true;
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteText('');
    setIsDeleting(false);
  };

  return (
    <>
      {/* Settings Button */}
      <TouchableOpacity
        style={[styles.settingsButton, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight }]}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-horizontal" size={18} color={colors.text} />
      </TouchableOpacity>

      {/* Dropdown Menu */}
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={[styles.dropdown, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.text} />
              <Text style={[styles.dropdownText, { color: colors.text }]}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={handlePrivacyPolicy}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} />
              <Text style={[styles.dropdownText, { color: colors.text }]}>Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={handleBlockedUsers}
              activeOpacity={0.7}
            >
              <Ionicons name="ban-outline" size={20} color={colors.text} />
              <Text style={[styles.dropdownText, { color: colors.text }]}>Blocked Users</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={() => {
                const newUnit = weightUnit === 'lbs' ? 'kg' : 'lbs';
                onWeightUnitChange?.(newUnit);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="barbell-outline" size={20} color={colors.text} />
              <Text style={[styles.dropdownText, { color: colors.text }]}>Weight Unit</Text>
              <Text style={[styles.dropdownText, { color: colors.secondaryText, marginLeft: 'auto' }]}>
                {weightUnit === 'kg' ? 'kg' : 'lbs'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleDeletePress}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[styles.dropdownText, { color: colors.error }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.deleteOverlay}>
          <View style={[styles.deleteModal, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
            {/* Header */}
            <View style={styles.deleteHeader}>
              <View style={[styles.deleteIconContainer, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="warning" size={28} color={colors.error} />
              </View>
              <Text style={[styles.deleteTitle, { color: colors.text }]}>Delete Account</Text>
              <Text style={[styles.deleteSubtitle, { color: colors.secondaryText }]}>
                This will permanently delete your account, posts, workouts, and all associated data. This action cannot be undone.
              </Text>
            </View>

            {/* Input */}
            <View style={styles.deleteInputSection}>
              <Text style={[styles.deleteInputLabel, { color: colors.secondaryText }]}>
                Type <Text style={{ fontWeight: FontWeight.bold, color: colors.text }}>DELETE</Text> to confirm
              </Text>
              <TextInput
                style={[
                  styles.deleteInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: deleteText === 'DELETE' ? colors.error : colors.border,
                    color: colors.text,
                  },
                ]}
                value={deleteText}
                onChangeText={setDeleteText}
                placeholder="DELETE"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isDeleting}
              />
            </View>

            {/* Buttons */}
            <View style={styles.deleteButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancelDelete}
                activeOpacity={0.7}
                disabled={isDeleting}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmDeleteButton,
                  { backgroundColor: colors.error },
                  deleteText !== 'DELETE' && styles.confirmDeleteDisabled,
                ]}
                onPress={handleConfirmDelete}
                activeOpacity={0.7}
                disabled={deleteText !== 'DELETE' || isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Settings button
  settingsButton: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // Dropdown
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  dropdown: {
    borderRadius: 20,
    ...Shadows.lg,
    minWidth: 180,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  dropdownText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  // Delete confirmation modal
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  deleteModal: {
    width: '100%',
    borderRadius: 24,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  deleteHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  deleteIconContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  deleteTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  deleteSubtitle: {
    fontSize: FontSize.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  deleteInputSection: {
    marginBottom: Spacing.xl,
  },
  deleteInputLabel: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  deleteInput: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    letterSpacing: 2,
    textAlign: 'center',
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteDisabled: {
    opacity: 0.4,
  },
  confirmDeleteText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
});

export default SettingsDropdown;
