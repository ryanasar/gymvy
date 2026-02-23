import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import RestDayPostModal from './RestDayPostModal';
import OptionsMenu from '@/components/ui/OptionsMenu';
import IconHeader from '@/components/ui/IconHeader';
import InfoBanner from '@/components/ui/InfoBanner';

const FreeRestDayCard = ({ splitName, splitEmoji, weekNumber, dayNumber, originalWorkoutName, onRestLogged, onUndoRestDay }) => {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showPostModal, setShowPostModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const handlePostRestDay = () => {
    setShowPostModal(true);
  };

  const handleRestDayPosted = () => {
    setShowPostModal(false);
    if (onRestLogged) {
      onRestLogged();
    }
  };

  // Theme-aware amber/warning colors
  const amberPrimary = isDark ? '#FBBF24' : '#F59E0B';
  const amberBackground = isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(245, 158, 11, 0.08)';
  const iconBackground = isDark ? 'rgba(251, 191, 36, 0.15)' : '#FEF3C7';
  const infoBackground = isDark ? 'rgba(251, 191, 36, 0.08)' : 'rgba(245, 158, 11, 0.06)';

  const menuItems = [
    {
      label: 'Undo Rest Day',
      icon: 'arrow-undo-outline',
      color: colors.error,
      onPress: () => {
        setShowOptionsMenu(false);
        if (onUndoRestDay) {
          onUndoRestDay();
        }
      },
    },
  ];

  return (
    <>
      <View style={[styles.card, { backgroundColor: amberBackground }]}>
        <IconHeader
          icon="😴"
          iconBackgroundColor={iconBackground}
          title="Rest & Recover"
          subtitle="Free Rest Day"
          subtitleColor={amberPrimary}
          action={
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={() => setShowOptionsMenu(!showOptionsMenu)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          }
        />

        <OptionsMenu
          visible={showOptionsMenu}
          onClose={() => setShowOptionsMenu(false)}
          items={menuItems}
        />

        {/* Split Info */}
        {splitName && (
          <View style={styles.splitInfo}>
            <Text style={[styles.splitText, { color: colors.primary }]}>
              {splitEmoji && `${splitEmoji} `}{splitName}
            </Text>
            <Text style={[styles.cycleInfo, { color: colors.secondaryText }]}>
              Cycle {weekNumber} · Day {dayNumber}
            </Text>
          </View>
        )}

        {originalWorkoutName && (
          <InfoBanner
            icon="information-circle-outline"
            iconColor={amberPrimary}
            message={`Your ${originalWorkoutName} workout will be tomorrow`}
            backgroundColor={infoBackground}
            textColor={colors.secondaryText}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.postRestDayButton, { backgroundColor: amberPrimary, shadowColor: amberPrimary }]}
            onPress={handlePostRestDay}
          >
            <View style={styles.postRestDayContent}>
              <Ionicons name="cloud-upload-outline" size={20} color={isDark ? '#111827' : '#FFFFFF'} />
              <Text style={[styles.postRestDayText, { color: isDark ? '#111827' : '#FFFFFF' }]}>Post Rest Day</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rest Day Post Modal */}
      <RestDayPostModal
        visible={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPostCreated={handleRestDayPosted}
        splitName={splitName}
        splitEmoji={splitEmoji}
        weekNumber={weekNumber}
        dayNumber={dayNumber}
        isFreeRestDay={true}
      />
    </>
  );
};

export default FreeRestDayCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 0,
  },
  splitInfo: {
    marginBottom: 16,
  },
  splitText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  cycleInfo: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 4,
  },
  postRestDayButton: {
    paddingVertical: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  postRestDayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  postRestDayText: {
    fontSize: 18,
    fontWeight: '700',
  },
  optionsButton: {
    padding: 4,
    borderRadius: 20,
  },
});
