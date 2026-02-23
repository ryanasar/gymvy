import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import EmptyState from '@/components/common/EmptyState';
import ModalHeader from '@/components/ui/ModalHeader';

const ChangeSplitModal = ({ visible, onClose, currentSplit, otherSplits, onSelectSplit }) => {
  const colors = useThemeColors();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
          <ModalHeader title="Switch Active Split" onClose={onClose} style={{ borderBottomWidth: 0, paddingHorizontal: 24 }} />

          {/* Current Split Info */}
          {currentSplit && (
            <View style={styles.currentSplitSection}>
              <Text style={[styles.currentSplitLabel, { color: colors.secondaryText }]}>Currently Active:</Text>
              <View style={[styles.currentSplitCard, { backgroundColor: colors.background }]}>
                <Text style={styles.currentSplitEmoji}>{currentSplit.emoji}</Text>
                <View style={styles.currentSplitInfo}>
                  <Text style={[styles.currentSplitName, { color: colors.text }]}>{currentSplit.name}</Text>
                  <Text style={[styles.currentSplitDetails, { color: colors.secondaryText }]}>
                    {currentSplit.totalDays} days
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
            <Ionicons name="swap-vertical" size={24} color={colors.secondaryText} />
            <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
          </View>

          {/* Other Splits List */}
          <Text style={[styles.selectLabel, { color: colors.secondaryText }]}>Select new active split:</Text>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {otherSplits && otherSplits.length > 0 ? (
              otherSplits.map((split) => (
                <TouchableOpacity
                  key={split.id}
                  style={[styles.splitOption, { backgroundColor: colors.background }]}
                  onPress={() => onSelectSplit(split)}
                  activeOpacity={0.7}
                >
                  <View style={styles.splitOptionContent}>
                    <Text style={styles.splitEmoji}>{split.emoji}</Text>
                    <View style={styles.splitInfo}>
                      <Text style={[styles.splitName, { color: colors.text }]}>{split.name}</Text>
                      <Text style={[styles.splitDetails, { color: colors.secondaryText }]}>
                        {split.totalDays} days
                        {split.description ? ` • ${split.description}` : ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <EmptyState
                icon="barbell-outline"
                title="No other splits available"
                message="Create a new split to switch to"
              />
            )}
          </ScrollView>

          {/* Cancel Button */}
          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.borderLight }]} onPress={onClose}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ChangeSplitModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 20,
    paddingBottom: 40,
  },
  // Current Split Section
  currentSplitSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  currentSplitLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentSplitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  currentSplitEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  currentSplitInfo: {
    flex: 1,
  },
  currentSplitName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  currentSplitDetails: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },

  // Select Label
  selectLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Modal Content
  modalContent: {
    paddingHorizontal: 24,
    maxHeight: 300,
  },
  splitOption: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  splitOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  splitInfo: {
    flex: 1,
  },
  splitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  splitDetails: {
    fontSize: 13,
  },

  // Empty State
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },

  // Cancel Button
  cancelButton: {
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
