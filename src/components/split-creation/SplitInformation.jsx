import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

const SplitInformation = ({ splitData, updateSplitData }) => {
  const colors = useThemeColors();
  const [selectedEmoji, setSelectedEmoji] = useState(splitData.emoji || '💪');

  const emojiOptions = [
    '💪', '🏋️', '🔥', '⚡', '🎯', '🚀',
    '💯', '🔱', '⭐', '🏆', '🦾', '💥',
    '👊', '🏃', '💎', '🦁', '⚔️', '🌟',
  ];
  const dayOptions = [3, 4, 5, 6, 7];


  const handleNameChange = (name) => {
    updateSplitData({ name });
  };

  const handleDescriptionChange = (description) => {
    updateSplitData({ description });
  };

  const handleEmojiSelect = (emoji) => {
    setSelectedEmoji(emoji);
    updateSplitData({ emoji });
  };

  const handleDaysSelect = (totalDays) => {
    updateSplitData({ totalDays });
  };


  const handleTogglePublic = () => {
    updateSplitData({ isPublic: !splitData.isPublic });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Split Details</Text>

        {/* Split Name */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Split Name *</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="Enter split name (e.g., Push Pull Legs)"
            placeholderTextColor={colors.secondaryText}
            value={splitData.name}
            onChangeText={handleNameChange}
            maxLength={50}
          />
        </View>

        {/* Emoji Selection */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Choose an Icon</Text>
          <View style={styles.emojiGrid}>
            {emojiOptions.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiButton,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  selectedEmoji === emoji && [styles.emojiButtonSelected, { borderColor: colors.primary, backgroundColor: colors.primary + '20' }]
                ]}
                onPress={() => handleEmojiSelect(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Number of Days */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Split Length (Including Rest Days)</Text>
          <View style={styles.daysGrid}>
            {dayOptions.map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.dayButton,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  splitData.totalDays === days && [styles.dayButtonSelected, { borderColor: colors.primary, backgroundColor: colors.primary }]
                ]}
                onPress={() => handleDaysSelect(days)}
              >
                <Text style={[
                  styles.dayButtonText,
                  { color: colors.text },
                  splitData.totalDays === days && [styles.dayButtonTextSelected, { color: colors.onPrimary }]
                ]}>
                  {days} days
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.descriptionInput, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="Describe your split routine..."
            placeholderTextColor={colors.secondaryText}
            value={splitData.description}
            onChangeText={handleDescriptionChange}
            maxLength={200}
            multiline={true}
            numberOfLines={3}
          />
        </View>

        {/* Public/Private Toggle */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={[styles.toggleContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={handleTogglePublic}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Make Public</Text>
              <Text style={[styles.toggleDescription, { color: colors.secondaryText }]}>
                Allow others to view and use your split
              </Text>
            </View>
            <View style={[
              styles.toggle,
              { backgroundColor: colors.borderLight },
              splitData.isPublic && [styles.toggleActive, { backgroundColor: colors.primary }]
            ]}>
              <View style={[
                styles.toggleButton,
                { backgroundColor: colors.onPrimary },
                splitData.isPublic && styles.toggleButtonActive
              ]} />
            </View>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
};

export default SplitInformation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  emojiButton: {
    width: '15%',
    aspectRatio: 1.2,
    borderWidth: 2,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButtonSelected: {
  },
  emojiText: {
    fontSize: 24,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 16,
  },
  dayButtonSelected: {
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayButtonTextSelected: {
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  toggleButtonActive: {
    alignSelf: 'flex-end',
  },
});