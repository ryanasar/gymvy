import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/lib/auth';
import { createSavedWorkout, updateSavedWorkout } from '@/services/api/savedWorkouts';
import { exercises } from '@/data/exercises/exerciseDatabase';
import ExercisePickerScreen from '@/components/exercises/ExercisePickerScreen';
import EmptyState from '@/components/common/EmptyState';

const CreateSavedWorkoutScreen = () => {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  // Parse params for edit mode
  const isEditMode = params.mode === 'edit';
  const workoutId = params.workoutId;
  const initialWorkoutData = params.workoutData ? JSON.parse(params.workoutData) : null;

  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [workoutEmoji, setWorkoutEmoji] = useState('💪');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize state from workout data in edit mode
  useEffect(() => {
    if (isEditMode && initialWorkoutData) {
      setWorkoutName(initialWorkoutData.name || '');
      setWorkoutDescription(initialWorkoutData.description || '');
      setWorkoutEmoji(initialWorkoutData.emoji || '💪');

      // Map exercises to include all needed fields
      if (initialWorkoutData.exercises && initialWorkoutData.exercises.length > 0) {
        const mappedExercises = initialWorkoutData.exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          sets: ex.sets?.toString() || '',
          reps: ex.reps?.toString() || '',
          weight: ex.weight?.toString() || '',
          restSeconds: ex.restSeconds?.toString() || '',
          notes: ex.notes || '',
          primaryMuscles: ex.primaryMuscles || [],
          secondaryMuscles: ex.secondaryMuscles || [],
          category: ex.category || '',
          isCustom: ex.isCustom || false,
        }));
        setSelectedExercises(mappedExercises);
      }
    }
  }, []);

  const handleSave = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    setSaving(true);
    try {
      const workoutPayload = {
        name: workoutName.trim(),
        description: workoutDescription.trim() || null,
        emoji: workoutEmoji,
        exercises: selectedExercises
      };

      if (isEditMode && workoutId) {
        await updateSavedWorkout(user?.id, workoutId, workoutPayload);
      } else {
        await createSavedWorkout(user?.id, workoutPayload);
      }

      router.back();
    } catch (error) {
      console.error('Failed to save workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const addExercise = (exercise, config) => {
    if (selectedExercises.length >= 20) {
      Alert.alert('Limit Reached', 'Maximum 20 exercises per workout');
      return;
    }

    const isCardio = exercise.exerciseType === 'cardio';

    const newExercise = {
      ...exercise,
      sets: isCardio ? '' : (config?.sets?.toString() || ''),
      reps: isCardio ? '' : (config?.reps?.toString() || ''),
      weight: isCardio ? '' : (config?.weight || ''),
      duration: isCardio ? (config?.duration?.toString() || '') : '',
      incline: isCardio ? (config?.incline?.toString() || '') : '',
      speed: isCardio ? (config?.speed?.toString() || '') : '',
      restSeconds: '',
      notes: ''
    };

    setSelectedExercises([...selectedExercises, newExercise]);
    setExercisePickerVisible(false);
  };

  const removeExercise = (index) => {
    const updated = [...selectedExercises];
    updated.splice(index, 1);
    setSelectedExercises(updated);
  };

  const updateExercise = (index, field, value) => {
    const updated = [...selectedExercises];
    updated[index][field] = value;
    setSelectedExercises(updated);
  };

  const handleReorderExercises = useCallback(({ data }) => {
    setSelectedExercises(data);
  }, []);

  const renderExerciseItem = useCallback(({ item, drag, isActive, getIndex }) => {
    const index = getIndex();
    return (
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        style={[
          styles.exerciseCard,
          { backgroundColor: colors.cardBackground, borderColor: colors.borderLight },
          isActive && { shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }
        ]}
      >
        <View style={styles.exerciseCardHeader}>
          <TouchableOpacity onPressIn={drag} disabled={isActive} style={styles.dragHandle}>
            <Ionicons name="menu" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          <View style={[styles.exerciseNumber, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.exerciseNumberText, { color: colors.primary }]}>{index + 1}</Text>
          </View>
          <Text style={[styles.exerciseName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity onPress={() => removeExercise(index)} style={styles.removeButton}>
            <Ionicons name="close-circle" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

        {item.exerciseType === 'cardio' ? (
          <View style={styles.exerciseInputs}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Duration</Text>
              <TextInput
                style={[styles.smallInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="20"
                placeholderTextColor={colors.placeholder}
                value={item.duration}
                onChangeText={(v) => updateExercise(index, 'duration', v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={[styles.unitLabel, { color: colors.secondaryText }]}>min</Text>
            </View>
            {item.cardioFields?.includes('incline') && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Incline</Text>
                <TextInput
                  style={[styles.smallInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.placeholder}
                  value={item.incline}
                  onChangeText={(v) => updateExercise(index, 'incline', v.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={[styles.unitLabel, { color: colors.secondaryText }]}>%</Text>
              </View>
            )}
            {item.cardioFields?.includes('speed') && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Speed</Text>
                <TextInput
                  style={[styles.smallInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="5"
                  placeholderTextColor={colors.placeholder}
                  value={item.speed}
                  onChangeText={(v) => updateExercise(index, 'speed', v.replace(/[^0-9.]/g, ''))}
                  keyboardType="decimal-pad"
                  maxLength={4}
                />
                <Text style={[styles.unitLabel, { color: colors.secondaryText }]}>mph</Text>
              </View>
            )}
            {item.cardioFields?.includes('resistance') && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Resistance</Text>
                <TextInput
                  style={[styles.smallInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="5"
                  placeholderTextColor={colors.placeholder}
                  value={item.incline}
                  onChangeText={(v) => updateExercise(index, 'incline', v.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.exerciseInputs}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Sets</Text>
              <TextInput
                style={[styles.smallInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="3"
                placeholderTextColor={colors.placeholder}
                value={item.sets}
                onChangeText={(v) => updateExercise(index, 'sets', v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Reps</Text>
              <TextInput
                style={[styles.smallInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="8-12"
                placeholderTextColor={colors.placeholder}
                value={item.reps}
                onChangeText={(v) => updateExercise(index, 'reps', v.replace(/[^0-9\-]/g, ''))}
                keyboardType="numbers-and-punctuation"
                maxLength={7}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Weight</Text>
              <TextInput
                style={[styles.smallInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="135"
                placeholderTextColor={colors.placeholder}
                value={item.weight}
                onChangeText={(v) => updateExercise(index, 'weight', v.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                maxLength={6}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [selectedExercises, colors]);

  const renderHeader = () => (
    <>
      {/* Workout Name */}
      <View style={styles.inputSection}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          Workout Name <Text style={{ color: colors.primary }}>*</Text>
        </Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., Push Day A"
          placeholderTextColor={colors.placeholder}
          value={workoutName}
          onChangeText={setWorkoutName}
          maxLength={50}
        />
      </View>

      {/* Description */}
      <View style={styles.inputSection}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Description (optional)</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
          placeholder="Brief description..."
          placeholderTextColor={colors.placeholder}
          value={workoutDescription}
          onChangeText={setWorkoutDescription}
          multiline
          maxLength={200}
        />
      </View>

      {/* Exercises Header */}
      <View style={styles.exercisesHeader}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Exercises</Text>
        <View style={[styles.counter, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.counterText, { color: colors.text }, selectedExercises.length >= 20 && { color: colors.error }]}>
            {selectedExercises.length}/20
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.addExerciseButton,
          { backgroundColor: colors.primary },
          selectedExercises.length >= 20 && { backgroundColor: colors.borderLight }
        ]}
        onPress={() => setExercisePickerVisible(true)}
        disabled={selectedExercises.length >= 20}
      >
        <Ionicons
          name="add-circle"
          size={20}
          color={selectedExercises.length >= 20 ? colors.secondaryText : colors.onPrimary}
        />
        <Text style={[
          styles.addExerciseText,
          { color: colors.onPrimary },
          selectedExercises.length >= 20 && { color: colors.secondaryText }
        ]}>
          Add Exercise
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderEmpty = () => (
    <EmptyState
      emoji="💪"
      title="No exercises added"
      message="Add exercises to build your workout"
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditMode ? 'Edit Workout' : 'Create Workout'}</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !workoutName.trim() || selectedExercises.length === 0}
          style={styles.headerButton}
        >
          <Text style={[
            styles.saveText,
            { color: colors.primary },
            (saving || !workoutName.trim() || selectedExercises.length === 0) && { opacity: 0.5 }
          ]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <DraggableFlatList
          data={selectedExercises}
          keyExtractor={(item, index) => `exercise-${item.id || item.name}-${index}`}
          onDragEnd={handleReorderExercises}
          renderItem={renderExerciseItem}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={renderEmpty()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>

      {/* Exercise Picker Modal */}
      <ExercisePickerScreen
        visible={exercisePickerVisible}
        onClose={() => setExercisePickerVisible(false)}
        onAddExercise={addExercise}
        exercises={exercises}
        existingExerciseIds={selectedExercises.map(ex => ex.id)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  counter: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 16,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dragHandle: {
    padding: 4,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 20,
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
  divider: {
    height: 1,
    marginBottom: 12,
  },
  exerciseInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  smallInput: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  unitLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  dragHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default CreateSavedWorkoutScreen;
