import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import ModalHeader from '@/components/ui/ModalHeader';
import Button from '@/components/ui/Button';
import IconHeader from '@/components/ui/IconHeader';

const BeginSplitCard = ({ split, onDaySelected }) => {
  const colors = useThemeColors();
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBeginSplit = () => {
    setShowDayPicker(true);
  };

  const handleDaySelect = async (dayIndex) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // Notify parent to set the selected day (parent handles backend update)
      await onDaySelected(dayIndex);
      setShowDayPicker(false);
    } catch (error) {
      console.error('Failed to start split:', error);
      Alert.alert('Error', 'Failed to start split. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
        <IconHeader
          icon={split.emoji || '💪'}
          iconBackgroundColor={colors.primary + '15'}
          title={split.name}
          subtitle="Ready to get started?"
        />

        {/* Description */}
        {split.description && (
          <Text style={[styles.description, { color: colors.text }]}>{split.description}</Text>
        )}

        {/* Split Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.infoText, { color: colors.secondaryText }]}>{split.numDays || split.totalDays} days</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="barbell-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.infoText, { color: colors.secondaryText }]}>
              {split.workoutDays?.filter(d => !d.isRest).length || 0} workouts
            </Text>
          </View>
        </View>

        {/* Begin Button */}
        <Button
          title="Begin Split"
          icon="play-circle"
          onPress={handleBeginSplit}
          size="lg"
          style={{ shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}
        />
      </View>

      {/* Day Picker Modal */}
      <Modal
        visible={showDayPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDayPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <ModalHeader
              title="Choose Starting Day"
              onClose={() => !isLoading && setShowDayPicker(false)}
              rightElement={isLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
            />

            <Text style={[styles.modalSubtitle, { color: colors.secondaryText }]}>
              Select which day you'd like to start with
            </Text>

            {/* Day List */}
            <ScrollView
              style={styles.dayList}
              showsVerticalScrollIndicator={false}
            >
              {split.days?.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayCard, { backgroundColor: colors.background, shadowColor: colors.shadow, opacity: isLoading ? 0.5 : 1 }]}
                  onPress={() => handleDaySelect(index)}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <View style={styles.dayCardContent}>
                    {day.emoji && <Text style={styles.dayEmoji}>{day.emoji}</Text>}
                    <View style={styles.dayInfo}>
                      <Text style={[styles.dayName, { color: colors.text }]}>
                        {day.isRest ? 'Rest Day' : (day.name || `Day ${index + 1}`)}
                      </Text>
                      {!day.isRest && day.exercises && (
                        <Text style={[styles.dayExercises, { color: colors.secondaryText }]}>
                          {day.exercises.length} exercises
                        </Text>
                      )}
                    </View>
                  </View>
                  {day.isRest && (
                    <View style={[styles.restBadge, { backgroundColor: colors.borderLight + '40' }]}>
                      <Ionicons name="moon" size={14} color={colors.secondaryText} />
                      <Text style={[styles.restBadgeText, { color: colors.secondaryText }]}>Rest</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
              )) || split.workoutDays?.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayCard, { backgroundColor: colors.background, shadowColor: colors.shadow, opacity: isLoading ? 0.5 : 1 }]}
                  onPress={() => handleDaySelect(index)}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <View style={styles.dayCardContent}>
                    {day.emoji && <Text style={styles.dayEmoji}>{day.emoji}</Text>}
                    <View style={styles.dayInfo}>
                      <Text style={[styles.dayName, { color: colors.text }]}>
                        {day.isRest ? 'Rest Day' : (day.workoutName || `Day ${index + 1}`)}
                      </Text>
                      {!day.isRest && day.exercises && (
                        <Text style={[styles.dayExercises, { color: colors.secondaryText }]}>
                          {JSON.parse(day.exercises || '[]').length} exercises
                        </Text>
                      )}
                    </View>
                  </View>
                  {day.isRest && (
                    <View style={[styles.restBadge, { backgroundColor: colors.borderLight + '40' }]}>
                      <Ionicons name="moon" size={14} color={colors.secondaryText} />
                      <Text style={[styles.restBadgeText, { color: colors.secondaryText }]}>Rest</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default BeginSplitCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalSubtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dayList: {
    paddingHorizontal: 20,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  dayCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  dayEmoji: {
    fontSize: 24,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayExercises: {
    fontSize: 13,
    fontWeight: '500',
  },
  restBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  restBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
