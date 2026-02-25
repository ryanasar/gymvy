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

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Monthly Recap</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.themeIconButton,
              recapTheme === 'dark' && { backgroundColor: colors.primary + '20' },
            ]}
            onPress={() => setRecapTheme('dark')}
          >
            <Ionicons
              name="moon"
              size={18}
              color={recapTheme === 'dark' ? colors.primary : colors.secondaryText}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeIconButton,
              recapTheme === 'light' && { backgroundColor: colors.primary + '20' },
            ]}
            onPress={() => setRecapTheme('light')}
          >
            <Ionicons
              name="sunny"
              size={18}
              color={recapTheme === 'light' ? colors.primary : colors.secondaryText}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Preview */}
      <ScrollView
        contentContainerStyle={styles.previewContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.recapWrapper, { borderColor: colors.text + '1A' }]}>
          <MonthlyRecapTemplate ref={recapRef} data={data} theme={recapTheme} />
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
  headerRight: {
    flexDirection: 'row',
    gap: 6,
  },
  themeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
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
    borderRadius: 14,
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
