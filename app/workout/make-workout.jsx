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
import { Colors } from '@/constants/colors';
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
      default: return Colors.light.secondary;
    }
  };

  const renderExerciseItem = useCallback(({ item }) => {
    const isCardio = isCardioExercise(item);
    const cardioFields = item.cardioFields || ['duration', 'incline'];

    return (
      <View style={styles.exerciseItem}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseNameContainer}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            {item.difficulty && (
              <View style={[styles.difficultyBadgeSmall, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                <Text style={styles.difficultyTextSmall}>{item.difficulty}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => removeExercise(item.id)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exerciseInputs}>
          {isCardio ? (
            /* Cardio inputs */
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (min)</Text>
                <TextInput
                  style={styles.input}
                  value={item.duration}
                  onChangeText={(value) => updateExercise(item.id, 'duration', value)}
                  keyboardType="numeric"
                  placeholder="30"
                />
              </View>

              {cardioFields.includes('incline') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Incline (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={item.incline}
                    onChangeText={(value) => updateExercise(item.id, 'incline', value)}
                    keyboardType="numeric"
                    placeholder="5"
                  />
                </View>
              )}

              {cardioFields.includes('speed') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Speed</Text>
                  <TextInput
                    style={styles.input}
                    value={item.speed}
                    onChangeText={(value) => updateExercise(item.id, 'speed', value)}
                    keyboardType="numeric"
                    placeholder="6"
                  />
                </View>
              )}
            </>
          ) : (
            /* Strength inputs */
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                  style={styles.setsInput}
                  value={item.sets.toString()}
                  onChangeText={(value) => updateExercise(item.id, 'sets', parseInt(value) || 1)}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={item.reps}
                  onChangeText={(value) => updateExercise(item.id, 'reps', value)}
                  keyboardType="numeric"
                  placeholder="12"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={item.weight}
                  onChangeText={(value) => updateExercise(item.id, 'weight', value)}
                  keyboardType="numeric"
                  placeholder="45"
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading exercise templates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Workout</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Details</Text>

          <TextInput
            style={styles.nameInput}
            placeholder="Workout name"
            value={workoutName}
            onChangeText={setWorkoutName}
          />

          <TextInput
            style={styles.notesInput}
            placeholder="Notes (optional)"
            value={workoutNotes}
            onChangeText={setWorkoutNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.exercisesSectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowExerciseModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={styles.noExercisesContainer}>
              <Text style={styles.noExercisesText}>No exercises added yet</Text>
              <Text style={styles.noExercisesSubtext}>Tap &quot;Add Exercise&quot; to get started</Text>
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, creating && styles.disabledButton]}
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
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.light.cardBackground,
    shadowColor: Colors.light.shadow,
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
    color: Colors.light.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
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
    color: Colors.light.text,
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  notesInput: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    height: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  exercisesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
    color: Colors.light.secondaryText,
    marginBottom: 4,
  },
  noExercisesSubtext: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },
  exerciseItem: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
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
    color: Colors.light.text,
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.error,
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
    color: Colors.light.secondaryText,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  setsInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    width: 60,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.light.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  createButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.light.secondaryText,
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
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.secondaryText,
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
    borderRadius: 8,
  },
  difficultyTextSmall: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default MakeWorkoutScreen;