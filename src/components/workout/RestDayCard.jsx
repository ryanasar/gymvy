import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import RestDayPostModal from './RestDayPostModal';
import OptionsMenu from '@/components/ui/OptionsMenu';
import IconHeader from '@/components/ui/IconHeader';

const RestDayCard = ({ splitName, splitEmoji, weekNumber, dayNumber, onRestLogged, onChangeWorkout }) => {
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

  const handleChangeWorkout = () => {
    setShowOptionsMenu(false);
    if (onChangeWorkout) {
      onChangeWorkout();
    }
  };

  // Theme-aware green colors
  const greenPrimary = isDark ? '#4ADE80' : '#4CAF50';
  const greenBackground = isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(76, 175, 80, 0.08)';
  const iconBackground = isDark ? 'rgba(74, 222, 128, 0.15)' : '#E8F5E9';

  const menuItems = [
    {
      label: "Change Today's Workout",
      icon: 'calendar-outline',
      onPress: handleChangeWorkout,
    },
  ];

  return (
    <>
      <View style={[styles.card, { backgroundColor: greenBackground, borderColor: greenPrimary }]}>
        <IconHeader
          icon="🌿"
          iconBackgroundColor={iconBackground}
          title="Rest & Recover"
          subtitle="Planned Rest Day"
          subtitleColor={greenPrimary}
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

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Post Rest Day Button */}
          <TouchableOpacity
            style={[styles.postRestDayButton, { backgroundColor: greenPrimary, shadowColor: greenPrimary }]}
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
      />
    </>
  );
};

export default RestDayCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
  },
  splitInfo: {
    marginBottom: 20,
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
    borderRadius: 12,
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
    borderRadius: 8,
  },
});
