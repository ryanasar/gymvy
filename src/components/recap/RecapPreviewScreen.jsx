import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { MonthlyRecapTemplate } from './MonthlyRecapTemplate';
import { shareRecap, saveRecapToGallery } from './RecapShareUtils';

/**
 * RecapPreviewScreen
 * Shows a preview of the monthly recap with theme toggle and share options
 *
 * @param {Object} data - The recap data
 * @param {Function} onClose - Callback to close the screen
 */
export function RecapPreviewScreen({ data, onClose }) {
  const colors = useThemeColors();
  const recapRef = useRef();
  const [recapTheme, setRecapTheme] = useState('dark');
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareRecap(recapRef);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveRecapToGallery(recapRef);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTheme = () => {
    setRecapTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Monthly Recap</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Preview */}
      <ScrollView
        contentContainerStyle={styles.previewContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.recapWrapper}>
          <MonthlyRecapTemplate ref={recapRef} data={data} theme={recapTheme} />
        </View>

        {/* Theme Toggle */}
        <View style={styles.themeToggleContainer}>
          <Text style={[styles.themeLabel, { color: colors.secondaryText }]}>
            Style
          </Text>
          <View style={[styles.themeToggle, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                recapTheme === 'dark' && styles.themeOptionActive,
                recapTheme === 'dark' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setRecapTheme('dark')}
            >
              <Ionicons
                name="moon"
                size={18}
                color={recapTheme === 'dark' ? '#fff' : colors.secondaryText}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  { color: recapTheme === 'dark' ? '#fff' : colors.secondaryText },
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeOption,
                recapTheme === 'light' && styles.themeOptionActive,
                recapTheme === 'light' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setRecapTheme('light')}
            >
              <Ionicons
                name="sunny"
                size={18}
                color={recapTheme === 'light' ? '#fff' : colors.secondaryText}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  { color: recapTheme === 'light' ? '#fff' : colors.secondaryText },
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionsContainer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.border }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="download-outline" size={22} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                Save
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleShare}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="share-outline" size={22} color="#fff" />
              <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                Share
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  recapWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  themeToggleContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  themeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  themeOptionActive: {
    // backgroundColor set dynamically
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecapPreviewScreen;
