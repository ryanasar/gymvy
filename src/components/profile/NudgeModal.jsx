import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

const NUDGE_MESSAGES = [
  { text: "Get TF in the gym!", emoji: "🔥" }
];

const MAX_CUSTOM_LENGTH = 100;

const NudgeModal = ({ visible, onClose, onSendNudge, recipientName, isLoading }) => {
  const colors = useThemeColors();
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedPreset(null);
      setCustomMessage('');
    }
  }, [visible]);

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    return () => keyboardDidShow.remove();
  }, []);

  const handleSend = () => {
    if (customMessage.trim()) {
      // Custom message takes priority
      onSendNudge(null, customMessage.trim());
    } else if (selectedPreset) {
      onSendNudge(selectedPreset, null);
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setSelectedPreset(null);
    setCustomMessage('');
    onClose();
  };

  const handleSelectPreset = (message) => {
    setSelectedPreset(message);
    setCustomMessage(''); // Clear custom when selecting preset
    Keyboard.dismiss();
  };

  const handleCustomChange = (text) => {
    setCustomMessage(text.slice(0, MAX_CUSTOM_LENGTH));
    if (text.length > 0) {
      setSelectedPreset(null); // Clear preset when typing custom
    }
  };

  const canSend = customMessage.trim().length > 0 || selectedPreset !== null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalWrapper}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {/* Header with poke emoji */}
                <View style={styles.header}>
                  <View style={styles.headerTitle}>
                    <Text style={styles.pokeEmoji}>👈</Text>
                    <Text style={[styles.title, { color: colors.text }]}>
                      Nudge {recipientName}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={colors.secondaryText} />
                  </TouchableOpacity>
                </View>

                {/* Subtitle */}
                <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                  Choose a message or write your own
                </Text>

                {/* Preset Message Options */}
                <View style={styles.presetsContainer}>
                  {NUDGE_MESSAGES.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.presetOption,
                        {
                          backgroundColor: selectedPreset === item.text
                            ? colors.primary + '15'
                            : colors.background,
                          borderColor: selectedPreset === item.text
                            ? colors.primary
                            : colors.borderLight
                        }
                      ]}
                      onPress={() => handleSelectPreset(item.text)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.presetEmoji}>{item.emoji}</Text>
                      <Text
                        style={[
                          styles.presetText,
                          { color: selectedPreset === item.text ? colors.primary : colors.text }
                        ]}
                      >
                        {item.text}
                      </Text>
                      {selectedPreset === item.text && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Divider with "or" */}
                <View style={styles.dividerContainer}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
                  <Text style={[styles.dividerText, { color: colors.secondaryText }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
                </View>

                {/* Custom Message Input - Always visible */}
                <View style={styles.customInputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={[
                      styles.customInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: customMessage.length > 0 ? colors.primary : colors.borderLight,
                        color: colors.text
                      }
                    ]}
                    placeholder="Write your own message..."
                    placeholderTextColor={colors.secondaryText}
                    value={customMessage}
                    onChangeText={handleCustomChange}
                    maxLength={MAX_CUSTOM_LENGTH}
                    multiline
                    textAlignVertical="top"
                    onFocus={() => {
                      setSelectedPreset(null);
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 100);
                    }}
                  />
                  <Text style={[styles.charCount, { color: customMessage.length > 80 ? colors.error : colors.secondaryText }]}>
                    {customMessage.length}/{MAX_CUSTOM_LENGTH}
                  </Text>
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { backgroundColor: colors.primary },
                    (!canSend || isLoading) && styles.sendButtonDisabled
                  ]}
                  onPress={handleSend}
                  disabled={!canSend || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.onPrimary} />
                  ) : (
                    <View style={styles.sendButtonContent}>
                      <Text style={styles.sendButtonEmoji}>👈</Text>
                      <Text style={[styles.sendButtonText, { color: colors.onPrimary }]}>
                        Send Nudge
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default NudgeModal;

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '80%',
  },
  modalContent: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pokeEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  presetsContainer: {
    gap: 10,
  },
  presetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  presetEmoji: {
    fontSize: 20,
  },
  presetText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 12,
  },
  customInputContainer: {
    marginBottom: 16,
  },
  customInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
    maxHeight: 100,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },
  sendButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendButtonEmoji: {
    fontSize: 18,
  },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
