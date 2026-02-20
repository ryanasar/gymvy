import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { exercises as exerciseDatabase } from '@/data/exercises/exerciseDatabase';
import EmptyState from '@/components/common/EmptyState';
import SavedWorkoutPickerModal from '@/components/split-creation/SavedWorkoutPickerModal';
import SaveWorkoutModal from '@/components/split-creation/SaveWorkoutModal';
import CreateCustomExerciseModal from '@/components/exercises/CreateCustomExerciseModal';
import ExercisePickerScreen from '@/components/exercises/ExercisePickerScreen';
import { getSavedWorkouts, createSavedWorkout } from '@/services/api/savedWorkouts';
import { getCustomExercises, createCustomExercise } from '@/services/api/customExercises';
import { useAuth } from '@/lib/auth';

// Isolated component for workout name input to prevent keyboard dismissal
const WorkoutNameInput = memo(({ initialValue, onChangeComplete, colors }) => {
  const [value, setValue] = useState(initialValue);
  const lastSavedRef = useRef(initialValue);
  const onChangeCompleteRef = useRef(onChangeComplete);
  onChangeCompleteRef.current = onChangeComplete;

  // Only update from props when the external value actually changes (e.g., saved workout applied)
  useEffect(() => {
    if (initialValue !== lastSavedRef.current) {
      setValue(initialValue);
      lastSavedRef.current = initialValue;
    }
  }, [initialValue]);

  const handleChange = (text) => {
    setValue(text);
    lastSavedRef.current = text;
  };

  const handleBlur = () => {
    onChangeCompleteRef.current(lastSavedRef.current);
  };

  return (
    <View style={styles.inputSection}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>Workout Name <Text style={[styles.required, { color: colors.primary }]}>*</Text></Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
        placeholder="e.g., Push Day, Leg Day"
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={handleChange}
        onBlur={handleBlur}
        maxLength={24}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.initialValue === nextProps.initialValue &&
         prevProps.colors.text === nextProps.colors.text;
});

// Rest Timer Presets
const REST_PRESETS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2m', value: 120 },
  { label: '3m', value: 180 },
];

// Helper function to format seconds as m:ss
const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Rest Timer Input Component with presets and stepper
const RestTimerInput = ({ value, onChange, colors }) => {
  const seconds = parseInt(value) || 0;

  const handlePreset = (presetValue) => {
    onChange(presetValue.toString());
  };

  const handleStep = (delta) => {
    const newValue = Math.max(0, Math.min(300, seconds + delta)); // 0-5 min
    onChange(newValue > 0 ? newValue.toString() : '');
  };

  return (
    <View style={restTimerStyles.container}>
      {/* Preset buttons row */}
      <View style={restTimerStyles.presetsRow}>
        {REST_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.value}
            style={[
              restTimerStyles.presetButton,
              { backgroundColor: colors.background, borderColor: colors.border },
              seconds === preset.value && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => handlePreset(preset.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              restTimerStyles.presetText,
              { color: colors.text },
              seconds === preset.value && { color: colors.onPrimary }
            ]}>
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stepper row */}
      <View style={restTimerStyles.stepperRow}>
        <TouchableOpacity
          style={[restTimerStyles.stepButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => handleStep(-15)}
          activeOpacity={0.7}
        >
          <Text style={[restTimerStyles.stepText, { color: colors.text }]}>−</Text>
        </TouchableOpacity>

        <View style={restTimerStyles.timeDisplay}>
          <Text style={[restTimerStyles.timeText, { color: colors.text }]}>{formatTime(seconds)}</Text>
        </View>

        <TouchableOpacity
          style={[restTimerStyles.stepButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => handleStep(15)}
          activeOpacity={0.7}
        >
          <Text style={[restTimerStyles.stepText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const restTimerStyles = StyleSheet.create({
  container: {
    gap: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  timeDisplay: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

const EditDayStep = ({
  // Existing props for split-day mode
  splitData,
  updateSplitData,
  editingDayIndex,
  // New props for workout-edit mode
  mode = 'split-day',  // 'split-day' | 'workout-edit'
  workoutData = null,  // { exercises: [...] }
  onWorkoutChange = null,
}) => {
  const colors = useThemeColors();
  const { user } = useAuth();
  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);

  // Saved workout states
  const [savedWorkoutPickerVisible, setSavedWorkoutPickerVisible] = useState(false);
  const [saveWorkoutModalVisible, setSaveWorkoutModalVisible] = useState(false);
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [loadingSavedWorkouts, setLoadingSavedWorkouts] = useState(false);
  const [savingWorkout, setSavingWorkout] = useState(false);

  // Custom exercise states
  const [customExercises, setCustomExercises] = useState([]);
  const [createCustomModalVisible, setCreateCustomModalVisible] = useState(false);

  // Track which exercise rest timers are expanded (by index)
  const [expandedRestTimers, setExpandedRestTimers] = useState({});

  // Determine mode
  const isWorkoutEditMode = mode === 'workout-edit';

  // Load custom exercises on mount
  useEffect(() => {
    const loadCustomExercises = async () => {
      try {
        const loadedExercises = await getCustomExercises(user?.id);
        setCustomExercises(loadedExercises);
      } catch (error) {
        console.error('Failed to load custom exercises:', error);
      }
    };
    loadCustomExercises();
  }, [user?.id]);

  // For split-day mode, validate that we have a valid day selected
  if (!isWorkoutEditMode && (editingDayIndex === null || !splitData?.workoutDays?.[editingDayIndex])) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.secondaryText }]}>No day selected</Text>
      </View>
    );
  }

  // Data abstraction - get exercises based on mode
  const currentDay = isWorkoutEditMode ? null : splitData.workoutDays[editingDayIndex];
  const exercises = isWorkoutEditMode
    ? (workoutData?.exercises || [])
    : (currentDay?.exercises || []);

  const updateCurrentDay = useCallback((updates) => {
    if (isWorkoutEditMode) {
      // In workout-edit mode, call onWorkoutChange with the updated exercises
      if (updates.exercises && onWorkoutChange) {
        onWorkoutChange({ ...workoutData, exercises: updates.exercises });
      }
    } else {
      // In split-day mode, update the split data
      const updatedWorkoutDays = [...splitData.workoutDays];
      updatedWorkoutDays[editingDayIndex] = {
        ...updatedWorkoutDays[editingDayIndex],
        ...updates
      };
      updateSplitData({ workoutDays: updatedWorkoutDays });
    }
  }, [isWorkoutEditMode, workoutData, onWorkoutChange, splitData?.workoutDays, editingDayIndex, updateSplitData]);

  const toggleRestDay = useCallback(() => {
    // Only available in split-day mode
    if (isWorkoutEditMode) return;

    const isCurrentlyRest = currentDay.isRest;
    updateCurrentDay({
      isRest: !isCurrentlyRest,
      workoutName: !isCurrentlyRest ? 'Rest Day' : '',
      workoutDescription: '',
      emoji: !isCurrentlyRest ? '😴' : '💪',
      exercises: []
    });
  }, [isWorkoutEditMode, currentDay?.isRest, updateCurrentDay]);

  const addExerciseToWorkout = (exercise, config) => {
    const currentExerciseCount = exercises.length;

    if (currentExerciseCount >= 20) {
      Alert.alert(
        'Exercise Limit Reached',
        'You can only add up to 20 exercises per workout.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Create a unique key for this instance of the exercise
    // This allows adding the same exercise multiple times
    const uniqueKey = `${exercise.id || exercise.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newExercise = {
      ...exercise,
      uniqueKey, // Add unique identifier for this specific instance
      sets: config?.sets?.toString() || '',
      reps: config?.reps?.toString() || '',
      weight: config?.weight || '',
      restSeconds: '',
      notes: ''
    };

    const updatedExercises = [...exercises, newExercise];
    updateCurrentDay({ exercises: updatedExercises });
  };

  const removeExerciseFromWorkout = useCallback((exerciseIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(exerciseIndex, 1);
    updateCurrentDay({ exercises: updatedExercises });
  }, [exercises, updateCurrentDay]);

  const updateExercise = useCallback((exerciseIndex, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex] = { ...updatedExercises[exerciseIndex], [field]: value };
    updateCurrentDay({ exercises: updatedExercises });
  }, [exercises, updateCurrentDay]);

  const handleReorderExercises = useCallback(({ data }) => {
    updateCurrentDay({ exercises: data });
  }, [updateCurrentDay]);

  // Handle opening create custom exercise modal
  const openCreateCustomModal = () => {
    // Close exercise picker first to avoid nested modal issues on iOS
    setExercisePickerVisible(false);
    // Small delay to allow the first modal to close
    setTimeout(() => {
      setCreateCustomModalVisible(true);
    }, 300);
  };

  // Handle creating a new custom exercise
  const handleCreateCustomExercise = async (exerciseData) => {
    const newExercise = await createCustomExercise(user?.id, exerciseData);
    setCustomExercises([...customExercises, newExercise]);
    // Re-open exercise picker after creating
    setTimeout(() => {
      setExercisePickerVisible(true);
    }, 300);
  };

  // Load saved workouts from local storage
  const loadSavedWorkouts = useCallback(async () => {
    setLoadingSavedWorkouts(true);
    try {
      const workouts = await getSavedWorkouts(user?.id);
      setSavedWorkouts(workouts);
    } catch (error) {
      console.error('Failed to load saved workouts:', error);
      Alert.alert('Error', 'Failed to load saved workouts');
    } finally {
      setLoadingSavedWorkouts(false);
    }
  }, [user?.id]);

  // Apply a saved workout to current day
  const applySavedWorkout = (savedWorkout) => {
    updateCurrentDay({
      workoutName: savedWorkout.name,
      workoutDescription: savedWorkout.description || '',
      workoutType: savedWorkout.workoutType || '',
      emoji: savedWorkout.emoji || '💪',
      exercises: savedWorkout.exercises || []
    });
    setSavedWorkoutPickerVisible(false);
  };

  // Save current day as a saved workout to local storage
  const saveCurrentDayAsWorkout = async (name, description) => {
    // Only available in split-day mode
    if (isWorkoutEditMode) return;

    setSavingWorkout(true);
    try {
      await createSavedWorkout(user?.id, {
        name,
        description,
        emoji: currentDay.emoji || '💪',
        workoutType: currentDay.workoutType || '',
        exercises: currentDay.exercises || []
      });
      setSaveWorkoutModalVisible(false);
    } catch (error) {
      console.error('Failed to save workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    } finally {
      setSavingWorkout(false);
    }
  };

  const renderHeader = () => (
    <>
      {/* Day Title, Quick Actions, Rest Day Toggle, Workout Name - only in split-day mode */}
      {!isWorkoutEditMode && (
        <>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Day {editingDayIndex + 1}</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Configure this workout day</Text>
          </View>

          {/* Quick Actions Row */}
          {!currentDay.isRest && (
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
                onPress={() => {
                  loadSavedWorkouts();
                  setSavedWorkoutPickerVisible(true);
                }}
              >
                <Ionicons name="folder-open-outline" size={18} color={colors.primary} />
                <Text style={[styles.quickActionText, { color: colors.primary }]}>Use Saved Workout</Text>
              </TouchableOpacity>

              {currentDay.exercises?.length > 0 && (
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}
                  onPress={() => setSaveWorkoutModalVisible(true)}
                >
                  <Ionicons name="bookmark-outline" size={18} color={colors.accent} />
                  <Text style={[styles.quickActionText, { color: colors.accent }]}>Save Workout</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Rest Day Toggle */}
          <View style={[styles.toggleSection, { backgroundColor: colors.borderLight }]}>
            <TouchableOpacity
              style={[styles.toggleOption, !currentDay.isRest && [styles.toggleOptionActive, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]]}
              onPress={() => currentDay.isRest && toggleRestDay()}
              activeOpacity={0.8}
            >
              <Text style={styles.toggleIcon}>💪</Text>
              <Text style={[styles.toggleText, { color: colors.secondaryText }, !currentDay.isRest && [styles.toggleTextActive, { color: colors.text }]]}>
                Workout
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleOption, currentDay.isRest && [styles.toggleOptionActive, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]]}
              onPress={() => !currentDay.isRest && toggleRestDay()}
              activeOpacity={0.8}
            >
              <Text style={styles.toggleIcon}>😴</Text>
              <Text style={[styles.toggleText, { color: colors.secondaryText }, currentDay.isRest && [styles.toggleTextActive, { color: colors.text }]]}>
                Rest
              </Text>
            </TouchableOpacity>
          </View>

          {/* Workout Name */}
          <WorkoutNameInput
            initialValue={currentDay.workoutName || ''}
            onChangeComplete={(value) => updateCurrentDay({ workoutName: value })}
            colors={colors}
          />
        </>
      )}

      {/* Exercises Header - always visible */}
      <View style={styles.exercisesSection}>
        <View style={styles.exercisesHeader}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Exercises</Text>
          <View style={[styles.exerciseCounter, { backgroundColor: colors.cardBackground }]}>
            <Text style={[
              styles.exerciseCounterText,
              { color: colors.text },
              (exercises.length >= 20) && styles.exerciseCounterTextLimit
            ]}>
              {exercises.length}/20
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addExerciseButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            (exercises.length >= 20) && [styles.addExerciseButtonDisabled, { backgroundColor: colors.borderLight }]
          ]}
          onPress={() => setExercisePickerVisible(true)}
          disabled={exercises.length >= 20}
        >
          <Ionicons name="add-circle" size={20} color={exercises.length >= 20 ? colors.secondaryText : colors.onPrimary} />
          <Text style={[
            styles.addExerciseText,
            { color: colors.onPrimary },
            (exercises.length >= 20) && [styles.addExerciseTextDisabled, { color: colors.secondaryText }]
          ]}>
            Add Exercise
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderEmptyList = useCallback(() => (
    <EmptyState
      emoji="💪"
      title="No exercises added"
      message="Add exercises to build your workout"
    />
  ), []);

  const renderExerciseItem = useCallback(({ item: exercise, drag, isActive, getIndex }) => {
    const index = getIndex();
    return (
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        style={[
          styles.exerciseCard,
          { backgroundColor: colors.cardBackground, shadowColor: colors.shadow },
          isActive && [styles.exerciseCardDragging, { backgroundColor: colors.cardBackground, shadowColor: colors.primary }]
        ]}
      >
          <View style={styles.exerciseCardHeader}>
            <TouchableOpacity
              onPressIn={drag}
              disabled={isActive}
              style={styles.dragHandle}
            >
              <View style={styles.dragDots}>
                {[0, 1].map((row) => (
                  <View key={row} style={styles.dragDotsRow}>
                    <View style={[styles.dragDot, { backgroundColor: colors.secondaryText }]} />
                    <View style={[styles.dragDot, { backgroundColor: colors.secondaryText }]} />
                    <View style={[styles.dragDot, { backgroundColor: colors.secondaryText }]} />
                    <View style={[styles.dragDot, { backgroundColor: colors.secondaryText }]} />
                  </View>
                ))}
              </View>
            </TouchableOpacity>
            <View style={[styles.exerciseNumber, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.exerciseNumberText, { color: colors.primary }]}>{index + 1}</Text>
            </View>
            <Text style={[styles.exerciseName, { color: colors.text }]}>{exercise.name}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeExerciseFromWorkout(index)}
            >
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View style={[styles.exerciseDivider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.exerciseInputs}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputGroupLabel, { color: colors.text }]}>Sets</Text>
              <TextInput
                style={[styles.smallInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="3"
                value={exercise.sets}
                onChangeText={(value) => updateExercise(index, 'sets', value.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={2}
                contextMenuHidden={true}
                placeholderTextColor={colors.placeholder}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputGroupLabel, { color: colors.text }]}>Reps</Text>
              <TextInput
                style={[styles.smallInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="8-12"
                value={exercise.reps}
                onChangeText={(value) => updateExercise(index, 'reps', value.replace(/[^0-9\-]/g, ''))}
                keyboardType="numbers-and-punctuation"
                maxLength={7}
                contextMenuHidden={true}
                placeholderTextColor={colors.placeholder}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputGroupLabel, { color: colors.text }]}>Weight</Text>
              <TextInput
                style={[styles.smallInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="135"
                value={exercise.weight}
                onChangeText={(value) => updateExercise(index, 'weight', value.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                maxLength={6}
                contextMenuHidden={true}
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>

          {/* Rest Timer Section - Collapsible */}
          <TouchableOpacity
            style={[styles.restTimerToggle, { borderTopColor: colors.borderLight }]}
            onPress={() => {
              setExpandedRestTimers(prev => ({
                ...prev,
                [index]: !prev[index]
              }));
            }}
            activeOpacity={0.7}
          >
            <View style={styles.restTimerToggleLeft}>
              <Ionicons
                name="timer-outline"
                size={18}
                color={exercise.restSeconds ? colors.primary : colors.secondaryText}
              />
              <Text style={[
                styles.restTimerToggleText,
                { color: exercise.restSeconds ? colors.text : colors.secondaryText }
              ]}>
                Rest Timer
              </Text>
            </View>
            <View style={styles.restTimerToggleRight}>
              {exercise.restSeconds ? (
                <Text style={[styles.restTimerValue, { color: colors.primary }]}>
                  {formatTime(parseInt(exercise.restSeconds))}
                </Text>
              ) : (
                <Text style={[styles.restTimerOffText, { color: colors.secondaryText }]}>
                  Off
                </Text>
              )}
              <Ionicons
                name={expandedRestTimers[index] ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.secondaryText}
              />
            </View>
          </TouchableOpacity>

          {/* Expanded Rest Timer Controls */}
          {expandedRestTimers[index] && (
            <View style={styles.restTimerExpanded}>
              <RestTimerInput
                value={exercise.restSeconds || ''}
                onChange={(value) => updateExercise(index, 'restSeconds', value)}
                colors={colors}
              />
              {exercise.restSeconds && (
                <TouchableOpacity
                  style={[styles.restTimerOffButton, { borderColor: colors.border }]}
                  onPress={() => updateExercise(index, 'restSeconds', '')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.restTimerOffButtonText, { color: colors.secondaryText }]}>
                    Turn Off
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
    );
  }, [exercises, removeExerciseFromWorkout, updateExercise, colors, expandedRestTimers]);

  // Rest day view uses ScrollView (only in split-day mode)
  if (!isWorkoutEditMode && currentDay?.isRest) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Day {editingDayIndex + 1}</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Configure this workout day</Text>
          </View>

          {/* Rest Day Toggle */}
          <View style={[styles.toggleSection, { backgroundColor: colors.borderLight }]}>
            <TouchableOpacity
              style={[styles.toggleOption, !currentDay.isRest && [styles.toggleOptionActive, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]]}
              onPress={() => currentDay.isRest && toggleRestDay()}
              activeOpacity={0.8}
            >
              <Text style={styles.toggleIcon}>💪</Text>
              <Text style={[styles.toggleText, { color: colors.secondaryText }, !currentDay.isRest && [styles.toggleTextActive, { color: colors.text }]]}>
                Workout
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleOption, currentDay.isRest && [styles.toggleOptionActive, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]]}
              onPress={() => !currentDay.isRest && toggleRestDay()}
              activeOpacity={0.8}
            >
              <Text style={styles.toggleIcon}>😴</Text>
              <Text style={[styles.toggleText, { color: colors.secondaryText }, currentDay.isRest && [styles.toggleTextActive, { color: colors.text }]]}>
                Rest
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.restDayContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
            <Text style={styles.restDayEmoji}>😴</Text>
            <Text style={[styles.restDayTitle, { color: colors.text }]}>Rest Day</Text>
            <Text style={[styles.restDayText, { color: colors.secondaryText }]}>Take time to recover and let your muscles grow</Text>
          </View>
        </ScrollView>

      </View>
    );
  }

  // Workout day view uses DraggableFlatList as main scroll container
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <DraggableFlatList
        data={exercises}
        extraData={exercises}
        keyExtractor={(item, index) => item.uniqueKey || `exercise-${item.id || item.name}-${index}`}
        onDragEnd={handleReorderExercises}
        renderItem={renderExerciseItem}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={null}
        ListEmptyComponent={renderEmptyList()}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* Exercise Picker Modal */}
      <ExercisePickerScreen
        visible={exercisePickerVisible}
        onClose={() => setExercisePickerVisible(false)}
        onAddExercise={addExerciseToWorkout}
        exercises={exerciseDatabase}
        customExercises={customExercises}
        existingExerciseIds={exercises.map(ex => ex.id || ex.exerciseId)}
        showCreateButton={true}
        onCreateCustom={openCreateCustomModal}
      />

      {/* Saved Workout Picker Modal - only in split-day mode */}
      {!isWorkoutEditMode && (
        <SavedWorkoutPickerModal
          visible={savedWorkoutPickerVisible}
          onClose={() => setSavedWorkoutPickerVisible(false)}
          savedWorkouts={savedWorkouts}
          loading={loadingSavedWorkouts}
          onSelectWorkout={applySavedWorkout}
        />
      )}

      {/* Save Workout Modal - only in split-day mode */}
      {!isWorkoutEditMode && (
        <SaveWorkoutModal
          visible={saveWorkoutModalVisible}
          onClose={() => setSaveWorkoutModalVisible(false)}
          onSave={saveCurrentDayAsWorkout}
          defaultName={currentDay?.workoutName || ''}
          defaultDescription={currentDay?.workoutDescription || ''}
          exerciseCount={exercises.length}
          saving={savingWorkout}
        />
      )}

      {/* Create Custom Exercise Modal */}
      <CreateCustomExerciseModal
        visible={createCustomModalVisible}
        onClose={() => setCreateCustomModalVisible(false)}
        onSave={handleCreateCustomExercise}
      />
    </View>
  );
};

export default EditDayStep;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  toggleSection: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 24,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  toggleOptionActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleIcon: {
    fontSize: 18,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleTextActive: {
    // color set dynamically
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    // color set dynamically
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
  },
  exercisesSection: {
    marginBottom: 24,
  },
  exercisesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  exerciseCounter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  exerciseCounterText: {
    fontSize: 14,
    fontWeight: '700',
  },
  exerciseCounterTextLimit: {
    color: '#EF4444',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addExerciseButtonDisabled: {
    shadowOpacity: 0,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addExerciseTextDisabled: {
    // color set dynamically
  },
  exercisesList: {
    gap: 0,
  },
  dragHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  exerciseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseCardDragging: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dragHandle: {
    padding: 4,
    marginRight: 4,
  },
  dragDots: {
    flexDirection: 'column',
    gap: 3,
  },
  dragDotsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  dragDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  exerciseDivider: {
    height: 1,
    marginBottom: 12,
  },
  exerciseInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  restTimerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  restTimerToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restTimerToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  restTimerToggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  restTimerValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  restTimerOffText: {
    fontSize: 14,
    fontWeight: '600',
  },
  restTimerExpanded: {
    marginTop: 12,
    paddingBottom: 4,
  },
  restTimerOffButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
  },
  restTimerOffButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    flex: 1,
  },
  inputGroupLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  smallInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  restDayContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  restDayEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  restDayTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  restDayText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});
