import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ExerciseCard from '@/components/exercises/ExerciseCard';
import { Colors } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { isCardioExercise, getCardioFields } from '@/data/exercises/exerciseDatabase';

const MUSCLE_GROUPS = [
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

const AddExerciseModal = ({
  visible,
  onClose,
  filteredExercises,
  searchQuery,
  onSearchChange,
  muscleFilter,
  onMuscleFilterChange,
  selectedExercise,
  onSelectExercise,
  sets,
  reps,
  onSetsChange,
  onRepsChange,
  onAddExercise,
  onCreateCustom,
  // Exercise type tab props
  exerciseTypeTab = 'strength',
  onExerciseTypeTabChange,
  // Cardio-specific props
  duration,
  onDurationChange,
  incline,
  onInclineChange,
  speed,
  onSpeedChange
}) => {
  const colors = useThemeColors();
  const isCardio = selectedExercise ? isCardioExercise(selectedExercise) : false;
  const cardioFields = selectedExercise ? getCardioFields(selectedExercise) : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.addExerciseModalContainer, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={[styles.addExerciseModalHeader, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
          <View style={styles.addExerciseModalHeaderContent}>
            <Text style={[styles.addExerciseModalTitle, { color: colors.text }]}>Add Exercise</Text>
            <View style={styles.addExerciseHeaderActions}>
              <TouchableOpacity style={styles.createCustomButton} onPress={onCreateCustom}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.createCustomButtonText, { color: colors.primary }]}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addExerciseModalCloseButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Exercise Type Tabs */}
        {onExerciseTypeTabChange && (
          <View style={[styles.exerciseTypeTabs, { borderBottomColor: colors.borderLight }]}>
            <TouchableOpacity
              style={[
                styles.exerciseTypeTab,
                exerciseTypeTab === 'strength' && [styles.exerciseTypeTabActive, { borderBottomColor: colors.primary }]
              ]}
              onPress={() => {
                onExerciseTypeTabChange('strength');
                onSelectExercise(null);
              }}
            >
              <Ionicons name="barbell-outline" size={18} color={exerciseTypeTab === 'strength' ? colors.primary : colors.secondaryText} />
              <Text style={[
                styles.exerciseTypeTabText,
                { color: exerciseTypeTab === 'strength' ? colors.primary : colors.secondaryText }
              ]}>Strength</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.exerciseTypeTab,
                exerciseTypeTab === 'cardio' && [styles.exerciseTypeTabActive, { borderBottomColor: colors.primary }]
              ]}
              onPress={() => {
                onExerciseTypeTabChange('cardio');
                onSelectExercise(null);
              }}
            >
              <Ionicons name="heart-outline" size={18} color={exerciseTypeTab === 'cardio' ? colors.primary : colors.secondaryText} />
              <Text style={[
                styles.exerciseTypeTabText,
                { color: exerciseTypeTab === 'cardio' ? colors.primary : colors.secondaryText }
              ]}>Cardio</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search */}
        <View style={[styles.addExerciseSearchContainer, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight }]}>
          <Ionicons name="search" size={20} color={colors.secondaryText} />
          <TextInput
            style={[styles.addExerciseSearchInput, { color: colors.text }]}
            placeholder="Search exercises..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>

        {/* Muscle Group Filter Pills - Only show for strength tab */}
        {exerciseTypeTab === 'strength' && (
          <View style={styles.addExerciseFilterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.addExerciseFilterScrollView}
              contentContainerStyle={styles.addExerciseFilterScrollContent}
            >
              {MUSCLE_GROUPS.map((muscle) => (
                <TouchableOpacity
                  key={muscle.id}
                  style={[
                    styles.addExerciseFilterPill,
                    { backgroundColor: colors.borderLight + '80' },
                    muscleFilter === muscle.id && [
                      styles.addExerciseFilterPillActive,
                      { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary }
                    ]
                  ]}
                  onPress={() => {
                    onMuscleFilterChange(muscle.id);
                    if (muscle.id !== 'all' && searchQuery.trim()) {
                      onSearchChange('');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.addExerciseFilterPillText,
                    { color: colors.text },
                    muscleFilter === muscle.id && [
                      styles.addExerciseFilterPillTextActive,
                      { color: colors.onPrimary }
                    ]
                  ]}>
                    {muscle.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Selected Exercise Config */}
        {selectedExercise && (
          <View style={[styles.addExerciseSelectedConfig, { backgroundColor: colors.cardBackground, borderColor: colors.primary + '40' }]}>
            <View style={styles.addExerciseSelectedBadge}>
              <Text style={[styles.addExerciseSelectedName, { color: colors.text }]}>{selectedExercise.name}</Text>
              <TouchableOpacity onPress={() => onSelectExercise(null)}>
                <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
            {isCardio ? (
              /* Cardio-specific config fields */
              <View style={styles.addExerciseConfigRow}>
                <View style={styles.addExerciseConfigItem}>
                  <Text style={[styles.addExerciseConfigLabel, { color: colors.secondaryText }]}>Duration (opt)</Text>
                  <TextInput
                    style={[styles.addExerciseConfigInput, { color: colors.text, borderColor: colors.borderLight }]}
                    value={duration}
                    onChangeText={onDurationChange}
                    keyboardType="number-pad"
                    placeholder="20"
                    placeholderTextColor={colors.secondaryText}
                    maxLength={3}
                  />
                </View>
                {cardioFields.includes('incline') && (
                  <View style={styles.addExerciseConfigItem}>
                    <Text style={[styles.addExerciseConfigLabel, { color: colors.secondaryText }]}>Incline % (opt)</Text>
                    <TextInput
                      style={[styles.addExerciseConfigInput, { color: colors.text, borderColor: colors.borderLight }]}
                      value={incline}
                      onChangeText={onInclineChange}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.secondaryText}
                      maxLength={2}
                    />
                  </View>
                )}
                {cardioFields.includes('speed') && (
                  <View style={styles.addExerciseConfigItem}>
                    <Text style={[styles.addExerciseConfigLabel, { color: colors.secondaryText }]}>Speed (opt)</Text>
                    <TextInput
                      style={[styles.addExerciseConfigInput, { color: colors.text, borderColor: colors.borderLight }]}
                      value={speed}
                      onChangeText={onSpeedChange}
                      keyboardType="decimal-pad"
                      placeholder="5"
                      placeholderTextColor={colors.secondaryText}
                      maxLength={4}
                    />
                  </View>
                )}
              </View>
            ) : (
              /* Strength exercise config fields */
              <View style={styles.addExerciseConfigRow}>
                <View style={styles.addExerciseConfigItem}>
                  <Text style={[styles.addExerciseConfigLabel, { color: colors.secondaryText }]}>Sets</Text>
                  <TextInput
                    style={[styles.addExerciseConfigInput, { color: colors.text, borderColor: colors.borderLight }]}
                    value={sets}
                    onChangeText={onSetsChange}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <View style={styles.addExerciseConfigItem}>
                  <Text style={[styles.addExerciseConfigLabel, { color: colors.secondaryText }]}>Reps</Text>
                  <TextInput
                    style={[styles.addExerciseConfigInput, { color: colors.text, borderColor: colors.borderLight }]}
                    value={reps}
                    onChangeText={onRepsChange}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>
            )}
            <TouchableOpacity
              style={[styles.addExerciseModalSaveButton, { backgroundColor: colors.primary, marginTop: 12 }]}
              onPress={onAddExercise}
            >
              <Text style={[styles.addExerciseModalSaveText, { color: colors.onPrimary }]}>
                Add to Workout
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Exercise List */}
        <ScrollView style={styles.addExerciseList} contentContainerStyle={styles.addExerciseListContent}>
          {filteredExercises.length === 0 && muscleFilter === 'my_exercises' ? (
            <View style={styles.emptyCustomExercises}>
              <Text style={[styles.emptyCustomText, { color: colors.secondaryText }]}>
                No custom exercises yet
              </Text>
              <TouchableOpacity
                style={[styles.createFirstButton, { backgroundColor: colors.primary }]}
                onPress={onCreateCustom}
              >
                <Ionicons name="add" size={18} color={colors.onPrimary} />
                <Text style={[styles.createFirstButtonText, { color: colors.onPrimary }]}>Create Your First</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {filteredExercises.map(exercise => {
                const isSelected = selectedExercise?.id === exercise.id;
                return (
                  <View
                    key={exercise.id}
                    style={isSelected ? [styles.addExerciseSelectedWrapper, { borderColor: colors.primary }] : styles.addExerciseCardWrapper}
                  >
                    <ExerciseCard
                      exercise={exercise}
                      onPress={() => onSelectExercise(exercise)}
                      compact={true}
                      showMuscles={false}
                      showCategory={false}
                      isCustom={exercise.isCustom}
                      style={isSelected ? { marginBottom: 0, borderWidth: 0 } : undefined}
                    />
                    {isSelected && (
                      <View style={[styles.addExerciseSelectedCheckmark, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
                      </View>
                    )}
                  </View>
                );
              })}
              {filteredExercises.length === 0 && (
                <Text style={[styles.addExerciseNoResults, { color: colors.secondaryText }]}>No exercises found</Text>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddExerciseModal;

const styles = StyleSheet.create({
  addExerciseModalContainer: {
    flex: 1,
  },
  exerciseTypeTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  exerciseTypeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  exerciseTypeTabActive: {},
  exerciseTypeTabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  addExerciseModalHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addExerciseModalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addExerciseModalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  addExerciseModalCloseButton: {
    padding: 4,
  },
  addExerciseModalSaveButton: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  addExerciseModalSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addExerciseSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  addExerciseSearchInput: {
    flex: 1,
    fontSize: 16,
  },
  addExerciseFilterSection: {
    paddingBottom: 12,
  },
  addExerciseFilterScrollView: {
    paddingHorizontal: 16,
  },
  addExerciseFilterScrollContent: {
    paddingRight: 16,
    gap: 10,
  },
  addExerciseFilterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  addExerciseFilterPillActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addExerciseFilterPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addExerciseFilterPillTextActive: {},
  addExerciseSelectedConfig: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  addExerciseSelectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addExerciseSelectedName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  addExerciseConfigRow: {
    flexDirection: 'row',
    gap: 16,
  },
  addExerciseConfigItem: {
    flex: 1,
  },
  addExerciseConfigLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addExerciseConfigInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  addExerciseList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addExerciseListContent: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  addExerciseCardWrapper: {},
  addExerciseSelectedWrapper: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 8,
    position: 'relative',
  },
  addExerciseSelectedCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addExerciseNoResults: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 40,
  },
  addExerciseHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createCustomButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCustomExercises: {
    alignItems: 'center',
    paddingVertical: 60,
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
    borderRadius: 20,
  },
  createFirstButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
