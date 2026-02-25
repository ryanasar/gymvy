import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { router } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getAllExerciseTemplates } from '@/services/api/exerciseTemplates';
import { createWorkout } from '@/services/api/workouts';
import { createExercise } from '@/services/api/exercises';
import { useAuth } from '@/lib/auth';
import ExercisePickerScreen from '@/components/exercises/ExercisePickerScreen';

/**
 * Check if an exercise is a cardio exercise
 */
const isCardioExercise = (exercise) => {
  return exercise?.exerciseType === 'cardio';
};

const MakeWorkoutScreen = () => {
  const colors = useThemeColors();
  const { user, refreshWorkouts } = useAuth();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [availableExerciseTemplates, setAvailableExerciseTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const templates = await getAllExerciseTemplates();
      setAvailableExerciseTemplates(templates);
    } catch (_error) {
      Alert.alert('Error', 'Failed to load exercise templates');
    } finally {
      setLoading(false);
    }
  };

  const addExercise = (template, config) => {
    const isCardio = template.exerciseType === 'cardio';
    const newExercise = {
      id: Date.now(),
      exerciseTemplateId: template.id,
      name: template.name,
      description: template.description,
      equipment: template.equipment,
      difficulty: template.difficulty,
      muscles: template.muscles,
      exerciseType: template.exerciseType || 'strength',
      cardioFields: template.cardioFields,
      // Strength fields
      reps: isCardio ? '' : (config?.reps?.toString() || ''),
      weight: isCardio ? '' : (config?.weight || ''),
      sets: isCardio ? 1 : (config?.sets || 1),
      // Cardio fields
      duration: isCardio ? (config?.duration?.toString() || '') : '',
      incline: isCardio ? (config?.incline?.toString() || '') : '',
      speed: isCardio ? (config?.speed?.toString() || '') : ''
    };
    setSelectedExercises([...selectedExercises, newExercise]);
  };

  const removeExercise = useCallback((id) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== id));
  }, []);

  const updateExercise = useCallback((id, field, value) => {
    setSelectedExercises(prev => prev.map(ex =>
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  }, []);

  const handleCreateWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    setCreating(true);
    try {
      const workoutData = {
        title: workoutName,
        notes: workoutNotes,
        userId: user?.id
      };

      const createdWorkout = await createWorkout(workoutData);

      // Create exercises for the workout
      for (const exercise of selectedExercises) {
        await createExercise({
          workoutId: createdWorkout.id,
          exerciseTemplateId: exercise.exerciseTemplateId,
          sets: exercise.sets,
          reps: exercise.reps ? parseInt(exercise.reps) : null,
          weight: exercise.weight ? parseInt(exercise.weight) : null,
          muscles: exercise.muscles?.map(m => m.muscle?.id || m.muscleId).filter(Boolean) || []
        });
      }
      await refreshWorkouts();

      Alert.alert('Success', 'Workout created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(tabs)/workout');
          }
        }
      ]);
    } catch (_error) {
      Alert.alert('Error', 'Failed to create workout');
    } finally {
      setCreating(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return colors.secondary;
    }
  };

  const renderExerciseItem = useCallback(({ item }) => {
    const isCardio = isCardioExercise(item);
    const cardioFields = item.cardioFields || ['duration', 'incline'];

    return (
      <View style={[styles.exerciseItem, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight }]}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseNameContainer}>
            <Text style={[styles.exerciseName, { color: colors.text }]}>{item.name}</Text>
            {item.difficulty && (
              <View style={[styles.difficultyBadgeSmall, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                <Text style={styles.difficultyTextSmall}>{item.difficulty}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => removeExercise(item.id)}
            style={[styles.removeButton, { backgroundColor: colors.error }]}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exerciseInputs}>
          {isCardio ? (
            /* Cardio inputs */
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Duration (min)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                  value={item.duration}
                  onChangeText={(value) => updateExercise(item.id, 'duration', value)}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor={colors.placeholder}
                />
              </View>

              {cardioFields.includes('incline') && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Incline (%)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                    value={item.incline}
                    onChangeText={(value) => updateExercise(item.id, 'incline', value)}
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              )}

              {cardioFields.includes('speed') && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Speed</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                    value={item.speed}
                    onChangeText={(value) => updateExercise(item.id, 'speed', value)}
                    keyboardType="numeric"
                    placeholder="6"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              )}
            </>
          ) : (
            /* Strength inputs */
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Sets</Text>
                <TextInput
                  style={[styles.setsInput, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                  value={item.sets.toString()}
                  onChangeText={(value) => updateExercise(item.id, 'sets', parseInt(value) || 1)}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={colors.placeholder}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Reps (optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                  value={item.reps}
                  onChangeText={(value) => updateExercise(item.id, 'reps', value)}
                  keyboardType="numeric"
                  placeholder="12"
                  placeholderTextColor={colors.placeholder}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Weight (optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                  value={item.weight}
                  onChangeText={(value) => updateExercise(item.id, 'weight', value)}
                  keyboardType="numeric"
                  placeholder="45"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            </>
          )}
        </View>
      </View>
    );
  }, [removeExercise, updateExercise]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Loading exercise templates...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text, flex: 1, textAlign: 'center' }]}>Create Workout</Text>
        <View style={styles.backButton} pointerEvents="none">
          <Text style={[styles.backButtonText, { opacity: 0 }]}>← Back</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout Details</Text>

          <TextInput
            style={[styles.nameInput, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight, color: colors.text }]}
            placeholder="Workout name"
            placeholderTextColor={colors.placeholder}
            value={workoutName}
            onChangeText={setWorkoutName}
          />

          <TextInput
            style={[styles.notesInput, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight, color: colors.text }]}
            placeholder="Notes (optional)"
            placeholderTextColor={colors.placeholder}
            value={workoutNotes}
            onChangeText={setWorkoutNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.exercisesSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercises</Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowExerciseModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={styles.noExercisesContainer}>
              <Text style={[styles.noExercisesText, { color: colors.secondaryText }]}>No exercises added yet</Text>
              <Text style={[styles.noExercisesSubtext, { color: colors.secondaryText }]}>Tap &quot;Add Exercise&quot; to get started</Text>
            </View>
          ) : (
            <FlatList
              data={selectedExercises}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderExerciseItem}
              scrollEnabled={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.cardBackground, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }, creating && { backgroundColor: colors.secondaryText }]}
          onPress={handleCreateWorkout}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.createButtonText}>Create Workout</Text>
          )}
        </TouchableOpacity>
      </View>

      <ExercisePickerScreen
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onAddExercise={addExercise}
        exercises={availableExerciseTemplates}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  nameInput: {
    borderRadius: 20,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  notesInput: {
    borderRadius: 20,
    padding: 16,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  exercisesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noExercisesContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noExercisesText: {
    fontSize: 16,
    marginBottom: 4,
  },
  noExercisesSubtext: {
    fontSize: 14,
  },
  exerciseItem: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  setsInput: {
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    width: 60,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  createButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  exerciseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  difficultyBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
  },
  difficultyTextSmall: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default MakeWorkoutScreen;