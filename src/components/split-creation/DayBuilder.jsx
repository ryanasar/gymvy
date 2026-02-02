import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { exercises } from '@/data/exercises/exerciseDatabase';
import ExercisePickerScreen from '@/components/exercises/ExercisePickerScreen';

const DayBuilder = ({ splitData, updateSplitData }) => {
  const colors = useThemeColors();
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);


  // Initialize workout days when component mounts or totalDays changes
  useEffect(() => {
    if (splitData.workoutDays.length !== splitData.totalDays) {
      const newWorkoutDays = Array.from({ length: splitData.totalDays }, (_, index) => ({
        dayIndex: index,
        workoutName: '',
        workoutDescription: '',
        emoji: '💪',
        isRest: false,
        exercises: []
      }));
      updateSplitData({ workoutDays: newWorkoutDays });
    }
  }, [splitData.totalDays]);

  const updateCurrentDay = React.useCallback((updates) => {
    const updatedWorkoutDays = [...splitData.workoutDays];
    updatedWorkoutDays[currentDayIndex] = {
      ...updatedWorkoutDays[currentDayIndex],
      ...updates
    };
    updateSplitData({ workoutDays: updatedWorkoutDays });
  }, [splitData.workoutDays, currentDayIndex, updateSplitData]);

  const toggleRestDay = () => {
    const isCurrentlyRest = currentDay.isRest;
    updateCurrentDay({
      isRest: !isCurrentlyRest,
      workoutName: !isCurrentlyRest ? 'Rest Day' : '',
      workoutDescription: !isCurrentlyRest ? '' : currentDay.workoutDescription,
      emoji: !isCurrentlyRest ? '😴' : '💪',
      exercises: !isCurrentlyRest ? [] : currentDay.exercises
    });
  };

  const addExerciseToWorkout = (exercise, config) => {
    const currentDay = splitData.workoutDays[currentDayIndex];
    const currentExerciseCount = currentDay.exercises?.length || 0;

    // Check if adding this exercise would exceed the limit
    if (currentExerciseCount >= 20) {
      Alert.alert(
        'Exercise Limit Reached',
        'You can only add up to 20 exercises per workout. Please remove an exercise before adding a new one.',
        [{ text: 'OK' }]
      );
      return;
    }

    const newExercise = {
      ...exercise,
      sets: config?.sets?.toString() || '',
      reps: config?.reps?.toString() || '',
      weight: config?.weight || '',
      notes: ''
    };

    const updatedExercises = [...(currentDay.exercises || []), newExercise];

    updateCurrentDay({ exercises: updatedExercises });
  };

  const removeExerciseFromWorkout = (exerciseIndex) => {
    const currentDay = splitData.workoutDays[currentDayIndex];
    const updatedExercises = [...currentDay.exercises];
    updatedExercises.splice(exerciseIndex, 1);
    updateCurrentDay({ exercises: updatedExercises });
  };

  const updateExercise = React.useCallback((exerciseIndex, field, value) => {
    const currentDay = splitData.workoutDays[currentDayIndex];
    const updatedExercises = [...currentDay.exercises];
    updatedExercises[exerciseIndex][field] = value;
    updateCurrentDay({ exercises: updatedExercises });
  }, [splitData.workoutDays, currentDayIndex, updateCurrentDay]);

  const goToNextDay = () => {
    if (currentDayIndex < splitData.totalDays - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const goToPreviousDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const canProceedToNext = () => {
    if (currentDay.isRest) {
      return true; // Rest days can always proceed
    }
    // For workout days, need workout name and at least one exercise
    return currentDay.workoutName?.trim() && currentDay.exercises?.length > 0;
  };

  const currentDay = splitData.workoutDays[currentDayIndex] || {};

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border, shadowColor: colors.shadow }]}>
      {/* Combined Header */}
      <View style={[styles.combinedHeader, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderLight }]}>
        {/* Navigation Row */}
        <View style={styles.navRow}>
          {currentDayIndex > 0 ? (
            <TouchableOpacity
              style={[styles.navButtonSecondary, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={goToPreviousDay}
            >
              <Text style={[styles.navButtonSecondaryText, { color: colors.text }]}>
                ← Prev
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navButtonPlaceholder} />
          )}

          <View style={[styles.dayIndicator, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}>
            <Text style={[styles.dayNumber, { color: colors.primary }]}>Day {currentDayIndex + 1}</Text>
            <Text style={[styles.dayProgress, { color: colors.primary }]}>
              {currentDayIndex + 1} of {splitData.totalDays}
            </Text>
          </View>

          {currentDayIndex < splitData.totalDays - 1 ? (
            <TouchableOpacity
              style={[
                styles.navButton,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
                !canProceedToNext() && [styles.navButtonDisabled, { backgroundColor: colors.borderLight }]
              ]}
              onPress={goToNextDay}
              disabled={!canProceedToNext()}
            >
              <Text style={[
                styles.navButtonText,
                { color: colors.onPrimary },
                !canProceedToNext() && [styles.navButtonTextDisabled, { color: colors.secondaryText }]
              ]}>
                Next →
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navButtonPlaceholder} />
          )}
        </View>

      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} scrollEnabled={!currentDay.isRest}>
        <View style={styles.dayContent}>
          {/* Day Type Toggle */}
          <View style={styles.dayTypeToggleContainer}>
            <View style={[styles.dayTypeToggleCard, { backgroundColor: colors.borderLight }]}>
              <TouchableOpacity
                style={[
                  styles.dayTypeOption,
                  !currentDay.isRest && [styles.dayTypeOptionActive, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]
                ]}
                onPress={() => !currentDay.isRest ? null : toggleRestDay()}
                activeOpacity={0.8}
              >
                <Text style={styles.dayTypeIcon}>💪</Text>
                <Text style={[
                  styles.dayTypeText,
                  { color: colors.secondaryText },
                  !currentDay.isRest && [styles.dayTypeTextActive, { color: colors.text }]
                ]}>
                  Workout
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dayTypeOption,
                  currentDay.isRest && [styles.dayTypeOptionActive, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]
                ]}
                onPress={() => currentDay.isRest ? null : toggleRestDay()}
                activeOpacity={0.8}
              >
                <Text style={styles.dayTypeIcon}>😴</Text>
                <Text style={[
                  styles.dayTypeText,
                  { color: colors.secondaryText },
                  currentDay.isRest && [styles.dayTypeTextActive, { color: colors.text }]
                ]}>
                  Rest
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Workout Name Section */}
          {!currentDay.isRest && (
            <View style={styles.workoutNameSection}>
              <View style={styles.sectionLabelContainer}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Workout Name</Text>
                <Text style={[styles.sectionRequiredIndicator, { color: colors.primary, backgroundColor: colors.primary + '15' }]}>Required</Text>
              </View>
              <Text style={[styles.sectionDescription, { color: colors.secondaryText }]}>
                Give this workout a descriptive name
              </Text>

              <View style={[styles.workoutNameCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, shadowColor: colors.shadow }]}>
                <TextInput
                  style={[styles.workoutNameInput, { color: colors.text }]}
                  placeholder="e.g., Push Day, Upper Body"
                  value={currentDay.workoutName}
                  onChangeText={(value) => updateCurrentDay({ workoutName: value })}
                  maxLength={24}
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
            </View>
          )}

          {/* Rest Day Message */}
          {currentDay.isRest && (
            <View style={[styles.restDayContainer, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight, shadowColor: colors.shadow }]}>
              <Text style={styles.restDayEmoji}>😴</Text>
              <Text style={[styles.restDayTitle, { color: colors.text }]}>Rest Day</Text>
              <Text style={[styles.restDayDescription, { color: colors.secondaryText }]}>
                Take time to recover and let your muscles grow. You can do light stretching or mobility work.
              </Text>
            </View>
          )}

          {/* Exercises Section */}
          {!currentDay.isRest && (
            <View style={styles.exercisesSection}>
              <View style={styles.sectionLabelContainer}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Exercises</Text>
                <Text style={[styles.sectionRequiredIndicator, { color: colors.primary, backgroundColor: colors.primary + '15' }]}>At least 1 required</Text>
              </View>
              <Text style={[styles.sectionDescription, { color: colors.secondaryText }]}>
                Add exercises to complete this workout
              </Text>

              <View style={styles.exercisesHeader}>
                <TouchableOpacity
                  style={[
                    styles.addExerciseButton,
                    { backgroundColor: colors.primary, shadowColor: colors.primary },
                    (currentDay.exercises?.length >= 20) && [styles.addExerciseButtonDisabled, { backgroundColor: colors.borderLight }]
                  ]}
                  onPress={() => setExercisePickerVisible(true)}
                  disabled={currentDay.exercises?.length >= 20}
                >
                  <Text style={[
                    styles.addExerciseText,
                    { color: colors.onPrimary },
                    (currentDay.exercises?.length >= 20) && [styles.addExerciseTextDisabled, { color: colors.secondaryText }]
                  ]}>
                    + Add Exercise
                  </Text>
                </TouchableOpacity>
                <View style={[styles.exerciseCounter, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[
                    styles.exerciseCounterText,
                    { color: colors.text },
                    (currentDay.exercises?.length >= 20) && styles.exerciseCounterTextLimit
                  ]}>
                    {currentDay.exercises?.length || 0}/20
                  </Text>
                </View>
              </View>

              {currentDay.exercises && currentDay.exercises.length > 0 ? (
                <View style={styles.exercisesList}>
                  {currentDay.exercises.map((exercise, exerciseIndex) => (
                    <View key={`${exercise.id || exercise.name}-${exerciseIndex}`} style={[styles.exerciseCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight, shadowColor: colors.shadow }]}>
                      <View style={styles.exerciseCardHeader}>
                        <View style={[styles.exerciseNumberContainer, { backgroundColor: colors.primary + '15' }]}>
                          <Text style={[styles.exerciseNumber, { color: colors.primary }]}>{exerciseIndex + 1}</Text>
                        </View>
                        <Text style={[styles.exerciseName, { color: colors.text }]}>
                          {exercise.name}
                        </Text>
                        <TouchableOpacity
                          style={[styles.removeButton, { backgroundColor: colors.borderLight }]}
                          onPress={() => removeExerciseFromWorkout(exerciseIndex)}
                        >
                          <Text style={[styles.removeButtonText, { color: colors.secondaryText }]}>×</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={[styles.exerciseDivider, { backgroundColor: colors.borderLight }]} />

                      <View style={styles.exerciseInputs}>
                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Sets</Text>
                          <TextInput
                            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                            placeholder="3"
                            value={exercise.sets}
                            onChangeText={(value) => updateExercise(exerciseIndex, 'sets', value)}
                            keyboardType="numeric"
                            placeholderTextColor={colors.secondaryText}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Reps</Text>
                          <TextInput
                            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                            placeholder="8-10"
                            value={exercise.reps}
                            onChangeText={(value) => updateExercise(exerciseIndex, 'reps', value)}
                            placeholderTextColor={colors.secondaryText}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Weight</Text>
                          <TextInput
                            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                            placeholder="135 lbs"
                            value={exercise.weight}
                            onChangeText={(value) => updateExercise(exerciseIndex, 'weight', value)}
                            placeholderTextColor={colors.secondaryText}
                          />
                        </View>

                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyExercises, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight, shadowColor: colors.shadow }]}>
                  <Text style={[styles.emptyExercisesText, { color: colors.secondaryText }]}>
                    No exercises added yet. Tap "Add Exercise" to get started.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Workout Description */}
          {!currentDay.isRest && (
            <View style={styles.descriptionSection}>
              <View style={styles.sectionLabelContainer}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Description</Text>
                <Text style={[styles.sectionOptionalIndicator, { color: colors.secondaryText, backgroundColor: colors.borderLight }]}>Optional</Text>
              </View>
              <Text style={[styles.sectionDescription, { color: colors.secondaryText }]}>
                Add any notes or focus areas for this workout
              </Text>

              <View style={[styles.descriptionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, shadowColor: colors.shadow }]}>
                <TextInput
                  style={[styles.descriptionInput, { color: colors.text }]}
                  placeholder="Describe this workout..."
                  value={currentDay.workoutDescription}
                  onChangeText={(value) => updateCurrentDay({ workoutDescription: value })}
                  maxLength={200}
                  multiline={true}
                  numberOfLines={3}
                  placeholderTextColor={colors.secondaryText}
                  textAlignVertical="top"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Exercise Picker Modal */}
      <ExercisePickerScreen
        visible={exercisePickerVisible}
        onClose={() => setExercisePickerVisible(false)}
        onAddExercise={addExerciseToWorkout}
        exercises={exercises}
      />
    </View>
  );
};

export default DayBuilder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  combinedHeader: {
    backgroundColor: Colors.light.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonDisabled: {
    backgroundColor: Colors.light.borderLight,
    shadowOpacity: 0,
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.onPrimary,
  },
  navButtonTextDisabled: {
    color: Colors.light.secondaryText,
  },
  navButtonSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  navButtonSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  navButtonPlaceholder: {
    width: 56,
    height: 28,
  },
  dayIndicator: {
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary + '20',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  dayProgress: {
    fontSize: 11,
    color: Colors.light.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: Colors.light.primary,
  },
  progressDotCompleted: {
    backgroundColor: Colors.light.primary + '80',
  },
  progressDotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.onPrimary,
  },
  content: {
    flex: 1,
  },
  dayContent: {
    padding: 24,
    gap: 40, // Increased spacing hierarchy between sections
  },

  // Section spacing and labels
  workoutNameSection: {
    marginBottom: 8,
  },
  exercisesSection: {
    marginBottom: 8,
  },
  descriptionSection: {
    marginBottom: 8,
  },
  sectionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  sectionRequiredIndicator: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sectionOptionalIndicator: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.light.secondaryText,
    backgroundColor: Colors.light.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    marginBottom: 16,
    lineHeight: 18,
  },

  // Day Type Toggle (Segmented Control)
  dayTypeToggleContainer: {
    marginBottom: 8,
  },
  dayTypeToggleCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.borderLight,
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  dayTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 7,
    gap: 6,
  },
  dayTypeOptionActive: {
    backgroundColor: Colors.light.cardBackground,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dayTypeIcon: {
    fontSize: 16,
  },
  dayTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.secondaryText,
  },
  dayTypeTextActive: {
    color: Colors.light.text,
  },

  // Workout Name Card
  workoutNameCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  workoutNameInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },

  // Description Card
  descriptionCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  descriptionInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: Colors.light.text,
    height: 90,
    textAlignVertical: 'top',
  },
  restDayContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  restDayEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  restDayTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  restDayDescription: {
    fontSize: 16,
    color: Colors.light.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  exercisesHeader: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addExerciseButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addExerciseButtonDisabled: {
    backgroundColor: Colors.light.borderLight,
    shadowOpacity: 0,
  },
  addExerciseText: {
    color: Colors.light.onPrimary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  addExerciseTextDisabled: {
    color: Colors.light.secondaryText,
  },
  exerciseCounter: {
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  exerciseCounterText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  exerciseCounterTextLimit: {
    color: '#EF4444',
  },
  exercisesList: {
    gap: 20, // Improved spacing between exercise cards
  },
  exerciseCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  exerciseNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
    lineHeight: 20,
  },
  removeButton: {
    width: 28,
    height: 28,
    backgroundColor: Colors.light.borderLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: Colors.light.secondaryText,
    lineHeight: 16,
  },
  exerciseDivider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  exerciseInputs: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyExercises: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyExercisesText: {
    fontSize: 15,
    color: Colors.light.secondaryText,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 20,
  },
});