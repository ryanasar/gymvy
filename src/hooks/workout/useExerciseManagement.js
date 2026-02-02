import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { storage } from '@/services/storage';

export const useExerciseManagement = ({ userId, todaysWorkout, refreshTodaysWorkout }) => {
  const [localExercises, setLocalExercises] = useState([]);

  const handleReorderExercises = useCallback(async ({ data }) => {
    setLocalExercises(data);

    try {
      const currentSplit = await storage.getSplit(userId);
      if (currentSplit) {
        const currentDayIndex = (todaysWorkout?.dayNumber || 1) - 1;
        const updatedSplit = JSON.parse(JSON.stringify(currentSplit));
        const days = updatedSplit.days || updatedSplit.workoutDays;

        if (days && days[currentDayIndex]) {
          days[currentDayIndex].exercises = data;
          await storage.saveSplit(userId, updatedSplit);
          await refreshTodaysWorkout();
        }
      }
    } catch (error) {
      console.error('[Exercise Management] Error saving reordered exercises:', error);
      Alert.alert('Error', 'Failed to save exercise order. Please try again.');
    }
  }, [userId, todaysWorkout, refreshTodaysWorkout]);

  const handleRemoveExercise = useCallback(async (exerciseIndex) => {
    const updatedExercises = localExercises.filter((_, index) => index !== exerciseIndex);
    setLocalExercises(updatedExercises);

    try {
      const currentSplit = await storage.getSplit(userId);
      if (currentSplit) {
        const currentDayIndex = (todaysWorkout?.dayNumber || 1) - 1;
        const updatedSplit = JSON.parse(JSON.stringify(currentSplit));
        const days = updatedSplit.days || updatedSplit.workoutDays;

        if (days && days[currentDayIndex]) {
          days[currentDayIndex].exercises = updatedExercises;
          await storage.saveSplit(userId, updatedSplit);
          await refreshTodaysWorkout();
        }
      }
    } catch (error) {
      console.error('[Exercise Management] Error removing exercise:', error);
      Alert.alert('Error', 'Failed to remove exercise. Please try again.');
    }
  }, [userId, localExercises, todaysWorkout, refreshTodaysWorkout]);

  const handleAddExercise = useCallback(async (selectedExercise, sets, reps, cardioConfig = {}) => {
    if (!selectedExercise) {
      Alert.alert('Select Exercise', 'Please select an exercise to add.');
      return;
    }

    const isCardio = selectedExercise.exerciseType === 'cardio';
    const setsInt = parseInt(sets) || 3;
    const repsInt = parseInt(reps) || 10;

    const newExercise = {
      id: selectedExercise.id,
      name: selectedExercise.name,
      exerciseType: selectedExercise.exerciseType || 'strength',
      cardioFields: selectedExercise.cardioFields,
      primaryMuscles: selectedExercise.primaryMuscles,
      secondaryMuscles: selectedExercise.secondaryMuscles,
      equipment: selectedExercise.equipment,
      // Strength fields
      sets: isCardio ? '1' : setsInt.toString(),
      reps: isCardio ? '' : repsInt.toString(),
      // Cardio fields
      duration: cardioConfig.duration || '',
      incline: cardioConfig.incline || '',
      speed: cardioConfig.speed || '',
    };

    const updatedExercises = [...localExercises, newExercise];
    setLocalExercises(updatedExercises);

    try {
      const currentSplit = await storage.getSplit(userId);
      if (currentSplit) {
        const currentDayIndex = (todaysWorkout?.dayNumber || 1) - 1;
        const updatedSplit = JSON.parse(JSON.stringify(currentSplit));
        const days = updatedSplit.days || updatedSplit.workoutDays;

        if (days && days[currentDayIndex]) {
          days[currentDayIndex].exercises = updatedExercises;
          await storage.saveSplit(userId, updatedSplit);
          await refreshTodaysWorkout();
        }
      }
    } catch (error) {
      console.error('[Exercise Management] Error adding exercise:', error);
      Alert.alert('Error', 'Failed to add exercise. Please try again.');
    }
  }, [userId, localExercises, todaysWorkout, refreshTodaysWorkout]);

  return {
    localExercises,
    setLocalExercises,
    handleReorderExercises,
    handleRemoveExercise,
    handleAddExercise
  };
};
