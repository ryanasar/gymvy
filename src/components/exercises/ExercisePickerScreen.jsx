import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import ExerciseCard from '@/components/exercises/ExerciseCard';

/**
 * Unified Exercise Picker Screen
 *
 * A full-screen modal component for selecting and configuring exercises.
 * Used across the app for adding exercises to splits, workouts, and sessions.
 *
 * @param {boolean} visible - Controls modal visibility
 * @param {function} onClose - Called when modal is dismissed
 * @param {function} onAddExercise - Called with (exercise, config) when exercise is added
 *   - For strength: { sets: number, reps: number, weight: string|null }
 *   - For cardio: { duration: string, incline: string, speed: string }
 * @param {array} exercises - List of available exercises
 * @param {array} customExercises - Optional: user's custom exercises
 * @param {array} existingExerciseIds - Optional: IDs of already-added exercises (shown with "Added" badge)
 * @param {number} defaultSets - Optional: default sets value (default: 3)
 * @param {number} defaultReps - Optional: default reps value (default: 10)
 * @param {function} onCreateCustom - Optional: callback to open custom exercise creation
 * @param {boolean} showCreateButton - Optional: show "Create" button in header (default: false)
 */
const ExercisePickerScreen = ({
  visible,
  onClose,
  onAddExercise,
  exercises = [],
  customExercises = [],
  existingExerciseIds = [],
  defaultSets = 3,
  defaultReps = 10,
  onCreateCustom,
  showCreateButton = false,
}) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  // Animation for config panel slide-up
  const configPanelAnim = useRef(new Animated.Value(0)).current;

  // Keyboard height state for moving config panel above keyboard
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Track keyboard to move config panel above it
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  // Tab & filter state
  const [exerciseTypeTab, setExerciseTypeTab] = useState('strength');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');

  // Selected exercise + config state (all start empty)
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState('');
  const [incline, setIncline] = useState('');
  const [speed, setSpeed] = useState('');

  // Animate config panel when exercise is selected/deselected
  useEffect(() => {
    Animated.spring(configPanelAnim, {
      toValue: selectedExercise ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [selectedExercise, configPanelAnim]);

  // Muscle groups for filtering
  const muscleGroups = [
    { id: 'all', name: 'All Exercises' },
    { id: 'my_exercises', name: 'My Exercises' },
    { id: 'chest', name: 'Chest' },
    { id: 'lats', name: 'Back' },
    { id: 'front_delts', name: 'Shoulders' },
    { id: 'biceps', name: 'Biceps' },
    { id: 'triceps', name: 'Triceps' },
    { id: 'quadriceps', name: 'Legs' },
    { id: 'core', name: 'Core' },
    { id: 'hamstrings', name: 'Hamstrings' },
    { id: 'glutes', name: 'Glutes' },
    { id: 'calves', name: 'Calves' },
    { id: 'forearms', name: 'Forearms' }
  ];

  // Helper to detect if an exercise is cardio
  const isCardioExercise = useCallback((exercise) => {
    if (!exercise) return false;
    return exercise.exerciseType === 'cardio';
  }, []);

  // Helper to get cardio fields for an exercise
  const getCardioFields = useCallback((exercise) => {
    if (!exercise) return ['duration', 'incline'];
    return exercise.cardioFields || ['duration', 'incline'];
  }, []);

  // Filter exercises based on tab, search, and muscle group
  const filteredExercises = useMemo(() => {
    // Handle "My Exercises" filter - only show custom exercises
    if (selectedMuscle === 'my_exercises') {
      let result = customExercises.map(ex => ({ ...ex, isCustom: true }));

      // Filter by exercise type tab
      result = result.filter(ex => {
        const isCardio = ex.exerciseType === 'cardio';
        return exerciseTypeTab === 'cardio' ? isCardio : !isCardio;
      });

      // Apply search
      if (searchQuery.trim()) {
        const lowercaseQuery = searchQuery.toLowerCase();
        result = result.filter(exercise =>
          exercise.name.toLowerCase().includes(lowercaseQuery) ||
          exercise.primaryMuscles?.some(muscle => muscle.toLowerCase().includes(lowercaseQuery)) ||
          exercise.equipment?.toLowerCase().includes(lowercaseQuery)
        );
      }

      return result;
    }

    // Merge bundled exercises with custom exercises
    const customWithFlag = customExercises.map(ex => ({ ...ex, isCustom: true }));
    let result = [...exercises, ...customWithFlag];

    // Filter by exercise type tab
    result = result.filter(ex => {
      const isCardio = ex.exerciseType === 'cardio';
      return exerciseTypeTab === 'cardio' ? isCardio : !isCardio;
    });

    // Filter by search
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(exercise =>
        exercise.name.toLowerCase().includes(lowercaseQuery) ||
        exercise.primaryMuscles?.some(muscle => muscle.toLowerCase().includes(lowercaseQuery)) ||
        exercise.secondaryMuscles?.some(muscle => muscle.toLowerCase().includes(lowercaseQuery)) ||
        exercise.equipment?.toLowerCase().includes(lowercaseQuery) ||
        exercise.category?.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Filter by muscle (strength only)
    if (exerciseTypeTab === 'strength' && selectedMuscle !== 'all') {
      result = result.filter(exercise =>
        exercise.primaryMuscles?.includes(selectedMuscle)
      );
    }

    return result;
  }, [exercises, customExercises, exerciseTypeTab, searchQuery, selectedMuscle]);

  // Reset state when modal opens/closes
  const handleClose = useCallback(() => {
    setSelectedExercise(null);
    setSearchQuery('');
    setSelectedMuscle('all');
    setSets('');
    setReps('');
    setWeight('');
    setDuration('');
    setIncline('');
    setSpeed('');
    onClose();
  }, [onClose]);

  // Handle tab change - clear selection and reset muscle filter
  const handleTabChange = useCallback((tab) => {
    setExerciseTypeTab(tab);
    setSelectedExercise(null);
    if (selectedMuscle !== 'all' && selectedMuscle !== 'my_exercises') {
      setSelectedMuscle('all');
    }
  }, [selectedMuscle]);

  // Handle muscle filter change
  const handleMuscleChange = useCallback((muscleId) => {
    setSelectedMuscle(muscleId);
    // Clear search when switching non-'all' filters for better UX
    if (muscleId !== 'all' && muscleId !== 'my_exercises' && searchQuery.trim()) {
      setSearchQuery('');
    }
  }, [searchQuery]);

  // Handle exercise selection - always show config panel
  const handleExerciseSelect = useCallback((exercise) => {
    // Reset config values when selecting a new exercise (all empty)
    setSets('');
    setReps('');
    setWeight('');
    setDuration('');
    setIncline('');
    setSpeed('');
    setSelectedExercise(exercise);
  }, []);

  // Safe parseInt that returns fallback on NaN
  const safeParseInt = (val, fallback) => {
    const parsed = parseInt(val);
    return isNaN(parsed) ? fallback : parsed;
  };

  // Handle add exercise with config
  const handleAddExercise = useCallback(() => {
    if (!selectedExercise) return;

    const config = isCardioExercise(selectedExercise)
      ? {
          duration: duration || '',
          incline: incline || '',
          speed: speed || ''
        }
      : {
          sets: safeParseInt(sets, defaultSets),
          reps: reps ? safeParseInt(reps, defaultReps) : '',
          weight: weight || ''
        };

    onAddExercise(selectedExercise, config);
    handleClose();
  }, [selectedExercise, isCardioExercise, duration, incline, speed, sets, reps, weight, defaultSets, defaultReps, onAddExercise, handleClose]);

  // Check if exercise is already added
  const isExerciseAdded = useCallback((exerciseId) => {
    return existingExerciseIds.includes(exerciseId);
  }, [existingExerciseIds]);

  // Render exercise item
  const renderExerciseItem = useCallback(({ item: exercise }) => {
    const isSelected = selectedExercise?.id === exercise.id;
    const isAdded = isExerciseAdded(exercise.id);

    return (
      <View style={isSelected ? [styles.selectedExerciseWrapper, { shadowColor: colors.primary }] : undefined}>
        <ExerciseCard
          exercise={exercise}
          onPress={() => !isAdded && handleExerciseSelect(exercise)}
          compact={true}
          showMuscles={false}
          showCategory={false}
          isCustom={exercise.isCustom}
          style={isAdded ? { opacity: 0.5 } : undefined}
        />
        {isSelected && (
          <View style={[styles.selectedCheckmark, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
          </View>
        )}
        {isAdded && (
          <View style={[styles.addedBadge, { backgroundColor: colors.borderLight }]}>
            <Text style={[styles.addedBadgeText, { color: colors.secondaryText }]}>Added</Text>
          </View>
        )}
      </View>
    );
  }, [selectedExercise, colors, isExerciseAdded, handleExerciseSelect]);

  // Render empty state for "My Exercises"
  const renderEmptyMyExercises = () => (
    <View style={styles.emptyCustomExercises}>
      <Text style={[styles.emptyCustomText, { color: colors.secondaryText }]}>
        No custom exercises yet
      </Text>
      {onCreateCustom && (
        <TouchableOpacity
          style={[styles.createFirstButton, { backgroundColor: colors.primary }]}
          onPress={onCreateCustom}
        >
          <Ionicons name="add" size={18} color={colors.onPrimary} />
          <Text style={[styles.createFirstButtonText, { color: colors.onPrimary }]}>Create Your First</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render slide-up config panel at the bottom
  const renderConfigPanel = () => {
    if (!selectedExercise) return null;

    const isCardio = isCardioExercise(selectedExercise);
    const cardioFields = getCardioFields(selectedExercise);

    const translateY = configPanelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    });

    return (
      <Animated.View
        style={[
          styles.configPanel,
          {
            backgroundColor: colors.cardBackground,
            shadowColor: '#000',
            transform: [{ translateY }],
            bottom: keyboardHeight > 0 ? keyboardHeight : 0,
            paddingBottom: keyboardHeight > 0 ? 16 : Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Config Panel Header */}
        <View style={styles.configPanelHeader}>
          <View style={styles.configPanelTitleContainer}>
            <Text style={[styles.configPanelExerciseName, { color: colors.text }]} numberOfLines={1}>
              {selectedExercise.name}
            </Text>
            <Text style={[styles.configPanelSummary, { color: colors.secondaryText }]}>
              {isCardio
                ? `${duration || '—'} min${cardioFields.includes('incline') ? ` · ${incline || '—'}%` : ''}${cardioFields.includes('speed') ? ` · ${speed || '—'} mph` : ''}`
                : `${sets || '—'} sets × ${reps || '—'} reps${weight ? ` @ ${weight} lbs` : ''}`
              }
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.configPanelCloseButton, { backgroundColor: colors.borderLight }]}
            onPress={() => setSelectedExercise(null)}
          >
            <Ionicons name="close" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        {/* Config Inputs */}
        {isCardio ? (
          <View style={styles.configRow}>
            <View style={styles.configInputGroup}>
              <Text style={[styles.configLabel, { color: colors.secondaryText }]}>DURATION</Text>
              <TextInput
                style={[styles.configInput, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholder="20"
                placeholderTextColor={colors.placeholder}
              />
              <Text style={[styles.configUnit, { color: colors.secondaryText }]}>min</Text>
            </View>
            {cardioFields.includes('incline') && (
              <View style={styles.configInputGroup}>
                <Text style={[styles.configLabel, { color: colors.secondaryText }]}>INCLINE</Text>
                <TextInput
                  style={[styles.configInput, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                  value={incline}
                  onChangeText={setIncline}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.placeholder}
                />
                <Text style={[styles.configUnit, { color: colors.secondaryText }]}>%</Text>
              </View>
            )}
            {cardioFields.includes('speed') && (
              <View style={styles.configInputGroup}>
                <Text style={[styles.configLabel, { color: colors.secondaryText }]}>SPEED</Text>
                <TextInput
                  style={[styles.configInput, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                  value={speed}
                  onChangeText={setSpeed}
                  keyboardType="decimal-pad"
                  placeholder="5"
                  placeholderTextColor={colors.placeholder}
                />
                <Text style={[styles.configUnit, { color: colors.secondaryText }]}>mph</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.configRow}>
            <View style={styles.configInputGroup}>
              <Text style={[styles.configLabel, { color: colors.secondaryText }]}>
                SETS <Text style={{ color: colors.primary }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.configInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: sets.trim() ? colors.borderLight : colors.primary,
                    color: colors.text
                  }
                ]}
                value={sets}
                onChangeText={setSets}
                keyboardType="numeric"
                placeholder="3"
                placeholderTextColor={colors.placeholder}
              />
            </View>
            <View style={styles.configInputGroup}>
              <Text style={[styles.configLabel, { color: colors.secondaryText }]}>REPS</Text>
              <TextInput
                style={[styles.configInput, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor={colors.placeholder}
              />
            </View>
            <View style={styles.configInputGroup}>
              <Text style={[styles.configLabel, { color: colors.secondaryText }]}>WEIGHT</Text>
              <TextInput
                style={[styles.configInput, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor={colors.placeholder}
              />
              <Text style={[styles.configUnit, { color: colors.secondaryText }]}>lbs</Text>
            </View>
          </View>
        )}

        {/* Add Button - requires sets for strength exercises only */}
        {(() => {
          const canAdd = isCardio || sets.trim() !== '';
          return (
            <TouchableOpacity
              style={[
                styles.addToWorkoutButton,
                { backgroundColor: canAdd ? colors.primary : colors.borderLight }
              ]}
              onPress={handleAddExercise}
              disabled={!canAdd}
            >
              <Text style={[
                styles.addToWorkoutButtonText,
                { color: canAdd ? colors.onPrimary : colors.secondaryText }
              ]}>
                Add to Workout
              </Text>
            </TouchableOpacity>
          );
        })()}
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Add Exercise</Text>
          {showCreateButton && onCreateCustom ? (
            <TouchableOpacity style={styles.createButton} onPress={onCreateCustom}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.createButtonText, { color: colors.primary }]}>Create</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerPlaceholder} />
          )}
        </View>

        {/* Exercise Type Tabs */}
        <View style={[styles.tabs, { borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              exerciseTypeTab === 'strength' && [styles.tabActive, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => handleTabChange('strength')}
          >
            <Ionicons
              name="barbell-outline"
              size={18}
              color={exerciseTypeTab === 'strength' ? colors.primary : colors.secondaryText}
            />
            <Text style={[
              styles.tabText,
              { color: exerciseTypeTab === 'strength' ? colors.primary : colors.secondaryText }
            ]}>Strength</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              exerciseTypeTab === 'cardio' && [styles.tabActive, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => handleTabChange('cardio')}
          >
            <Ionicons
              name="heart-outline"
              size={18}
              color={exerciseTypeTab === 'cardio' ? colors.primary : colors.secondaryText}
            />
            <Text style={[
              styles.tabText,
              { color: exerciseTypeTab === 'cardio' ? colors.primary : colors.secondaryText }
            ]}>Cardio</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
            <Ionicons name="search" size={20} color={colors.secondaryText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search exercises..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Muscle Group Filter Pills - Only show for strength tab */}
        {exerciseTypeTab === 'strength' && (
          <View style={styles.filterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {muscleGroups.map((muscle) => (
                <TouchableOpacity
                  key={muscle.id}
                  style={[
                    styles.filterPill,
                    { backgroundColor: colors.borderLight + '80' },
                    selectedMuscle === muscle.id && [styles.filterPillActive, { backgroundColor: colors.primary }]
                  ]}
                  onPress={() => handleMuscleChange(muscle.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.filterPillText,
                    { color: colors.text },
                    selectedMuscle === muscle.id && [styles.filterPillTextActive, { color: colors.onPrimary }]
                  ]}>
                    {muscle.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Exercise List */}
        {filteredExercises.length === 0 && selectedMuscle === 'my_exercises' ? (
          renderEmptyMyExercises()
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id?.toString() || item.name}
            renderItem={renderExerciseItem}
            contentContainerStyle={[
              styles.listContent,
              selectedExercise && styles.listContentWithPanel
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={[styles.noExercisesText, { color: colors.secondaryText }]}>
                No exercises found
              </Text>
            }
          />
        )}

        {/* Slide-up Config Panel */}
        {renderConfigPanel()}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ExercisePickerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 60,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Slide-up Config Panel (positioned at bottom)
  configPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  configPanelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  configPanelTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  configPanelExerciseName: {
    fontSize: 18,
    fontWeight: '700',
  },
  configPanelSummary: {
    fontSize: 14,
    marginTop: 4,
  },
  configPanelCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  configInputGroup: {
    flex: 1,
    alignItems: 'center',
  },
  configLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  configInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    width: '100%',
  },
  configUnit: {
    fontSize: 12,
    marginTop: 4,
  },
  addToWorkoutButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addToWorkoutButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  // Tabs
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    // borderBottomColor set dynamically
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Search
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  // Filter Pills
  filterSection: {
    paddingBottom: 16,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterPillActive: {
    // backgroundColor set dynamically
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterPillTextActive: {
    // color set dynamically
  },
  // Exercise List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  listContentWithPanel: {
    paddingBottom: 280, // Extra padding when config panel is visible
  },
  selectedExerciseWrapper: {
    borderRadius: 20,
    borderWidth: 0,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  selectedCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  addedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noExercisesText: {
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 15,
  },
  // Empty Custom Exercises
  emptyCustomExercises: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyCustomText: {
    fontSize: 16,
    marginBottom: 16,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  createFirstButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
