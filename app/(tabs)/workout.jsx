import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
// Navigation guard ref for double-click prevention
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CelebrationAnimation from '@/components/animations/CelebrationAnimation';
import RestDayCard from '@/components/workout/RestDayCard';
import FreeRestDayCard from '@/components/workout/FreeRestDayCard';
import BeginSplitCard from '@/components/workout/BeginSplitCard';
import SplitWorkoutCard from '@/components/workout/SplitWorkoutCard';
import IndividualWorkoutView from '@/components/workout/IndividualWorkoutView';
import IndividualWorkoutCompletedCard from '@/components/workout/IndividualWorkoutCompletedCard';
import SavedWorkoutPicker from '@/components/workout/SavedWorkoutPicker';
import SavedWorkoutDetailCard from '@/components/workout/SavedWorkoutDetailCard';
import TabBar from '@/components/ui/TabBar';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useSync } from '@/contexts/SyncContext';
import { useAuth } from '@/lib/auth';
import { getActiveWorkout, calculateStreakFromLocal, createCompletedWorkoutSession } from '@/services/storage';
import { getCalendarData } from '@/services/storage/calendarStorage';
import { isFreeRestDayAvailable, clearFreeRestDayUsageForToday } from '@/services/storage/freeRestDayStorage';
import { markRestDay } from '@/services/api/dailyActivity';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { getSavedWorkouts } from '@/services/api/savedWorkouts';
import { useWorkoutCompletion } from '@/hooks/workout/useWorkoutCompletion';
import { calculateWorkoutCardCollapse } from '@/utils/workout/workoutCalculations';
import { handleDaySelection } from '@/utils/workout/splitManagement';
import { buildBadges } from '@/constants/badges';

const WORKOUT_TABS = [
  { key: 'split', label: 'My Split' },
  { key: 'individual', label: 'Individual' },
];

const WorkoutScreen = () => {
  const colors = useThemeColors();
  const { contentMaxWidth } = useResponsiveLayout();
  const responsiveStyle = contentMaxWidth
    ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }
    : undefined;
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const {
    todaysWorkout,
    activeSplit,
    markWorkoutCompleted,
    markFreeRestDay,
    todaysWorkoutCompleted,
    completedSessionId: cachedSessionId,
    refreshTodaysWorkout,
    isInitialized,
    individualWorkoutCompleted,
    completedIndividualWorkout,
    markIndividualWorkoutCompleted,
    completedSplitWorkout,
  } = useWorkout();
  const { updatePendingCount, manualSync } = useSync();

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasActiveWorkout, setHasActiveWorkout] = useState(false);
  const skipAutoResumeRef = useRef(false);
  const completionProcessedRef = useRef(false);
  const [freeRestDayAvailable, setFreeRestDayAvailable] = useState(false);
  const [workoutMode, setWorkoutMode] = useState('split');
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [selectedSavedWorkout, setSelectedSavedWorkout] = useState(null);
  const [isPostProcessing, setIsPostProcessing] = useState(false);

  // Modal state
  const [showChangeDayModal, setShowChangeDayModal] = useState(false);
  const [isDaySelecting, setIsDaySelecting] = useState(false);

  // Navigation guard to prevent double-click issues
  const isNavigatingRef = useRef(false);

  // Track last focus time to prevent rapid re-execution of focus effects
  const lastFocusTimeRef = useRef(0);
  const FOCUS_COOLDOWN_MS = 1000;

  // Navigation handler with double-click protection
  const handleNavigation = useCallback((path, params = null) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    if (params) {
      router.push({ pathname: path, params });
    } else {
      router.push(path);
    }
    // Reset after navigation completes
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 500);
  }, [router]);

  const isCompleted = todaysWorkoutCompleted;
  const completedSessionId = cachedSessionId;

  // Auto-sync when workout tab is focused (with cooldown to prevent rapid re-sync)
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastFocusTimeRef.current < FOCUS_COOLDOWN_MS) return;
      lastFocusTimeRef.current = now;
      manualSync();
    }, [manualSync])
  );

  // Check free rest day availability on focus
  useFocusEffect(
    useCallback(() => {
      const checkFreeRestDay = async () => {
        const isRest = todaysWorkout?.isRest || (todaysWorkout?.exercises?.length === 0 && todaysWorkout?.dayName === 'Rest Day');
        if (!isRest && !todaysWorkoutCompleted && todaysWorkout) {
          const available = await isFreeRestDayAvailable();
          setFreeRestDayAvailable(available);
        } else {
          setFreeRestDayAvailable(false);
        }
      };
      checkFreeRestDay();
    }, [todaysWorkoutCompleted, todaysWorkout])
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshTodaysWorkout();
    setRefreshing(false);
  }, [refreshTodaysWorkout]);

  // Custom hooks
  const { isToggling, setIsToggling, handleToggleCompletion } = useWorkoutCompletion({
    userId: user?.id,
    markWorkoutCompleted,
    updatePendingCount,
    todaysWorkout,
    activeSplit,
    isRestDay: todaysWorkout?.isRest || (todaysWorkout?.exercises?.length === 0 && todaysWorkout?.dayName === 'Rest Day'),
    completedSessionId
  });


  // Load saved workout mode preference on mount
  useEffect(() => {
    const loadWorkoutMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('workoutModePreference');
        if (savedMode === 'split' || savedMode === 'individual') {
          setWorkoutMode(savedMode);
        }
      } catch (error) {
        console.error('[Workout] Error loading workout mode preference:', error);
      }
    };
    loadWorkoutMode();
  }, []);

  // Handle workout mode change (save to AsyncStorage)
  const handleWorkoutModeChange = useCallback(async (mode) => {
    setWorkoutMode(mode);
    try {
      await AsyncStorage.setItem('workoutModePreference', mode);
    } catch (error) {
      console.error('[Workout] Error saving workout mode preference:', error);
    }
  }, []);

  // Calculate workout card collapse state
  const { shouldCollapse, maxVisibleExercises } = useMemo(() =>
    calculateWorkoutCardCollapse(todaysWorkout),
    [todaysWorkout]
  );

  // Handle returning from completed workout session
  useEffect(() => {
    const handleCompletedSession = async () => {
      // Reset the ref when not in completed state (allows future completions)
      if (params.completed !== 'true') {
        completionProcessedRef.current = false;
        return;
      }

      // Only process completion once per session
      if (completionProcessedRef.current) {
        return;
      }
      completionProcessedRef.current = true;

      // Handle individual workout completion (freestyle or saved)
      const source = params.source;
      if (source === 'freestyle' || source === 'saved') {
        // Switch to Individual tab to show the completed card
        setWorkoutMode('individual');
      }

      // Show celebration IMMEDIATELY, process in background
      setShowCelebration(true);
      setIsPostProcessing(true);

      try {
        // Mark individual workout completed (freestyle/saved only)
        if (source === 'freestyle' || source === 'saved') {
          if (params.workoutData) {
            try {
              const workoutData = JSON.parse(params.workoutData);
              await markIndividualWorkoutCompleted(workoutData);
            } catch (error) {
              console.error('[Workout Tab] Error parsing workout data:', error);
            }
          }
        }

        // Calculate streak
        try {
          const streak = await calculateStreakFromLocal(user?.id, 'workout');
          setCurrentStreak(streak);
        } catch (error) {
          console.error('[Workout Tab] Error calculating streak after session:', error);
        }
      } finally {
        setIsPostProcessing(false);
      }
    };
    handleCompletedSession();
  }, [params.completed, params.source, params.workoutData, markIndividualWorkoutCompleted]);

  // Check for active workout and auto-resume
  useEffect(() => {
    // Latch the skip flag when arriving from pause/complete/discard so it
    // survives across effect re-runs even if route params get cleared.
    if (params.paused === 'true' || params.completed === 'true' || params.discarded === 'true') {
      skipAutoResumeRef.current = true;
    }

    const checkAndResumeWorkout = async () => {
      try {
        const activeWorkout = await getActiveWorkout(user?.id);
        setHasActiveWorkout(!!activeWorkout);

        // Don't auto-resume if we just paused, completed, or discarded a workout
        if (skipAutoResumeRef.current) {
          return;
        }

        if (activeWorkout && todaysWorkout) {
          // Navigate to session screen with workout data
          router.replace({
            pathname: '/workout/session',
            params: {
              workoutData: JSON.stringify(todaysWorkout)
            }
          });
        }
      } catch (error) {
        console.error('[Workout Tab] Error checking for active workout:', error);
      }
    };

    checkAndResumeWorkout();
  }, [todaysWorkout, params.paused, params.completed, params.discarded]);

  // Check if it's a rest day
  const isRestDay = todaysWorkout?.isRest || (todaysWorkout?.exercises && todaysWorkout.exercises.length === 0 && todaysWorkout?.dayName === 'Rest Day');

  // Track if we've already auto-marked rest day for today
  const autoMarkedRestDayRef = useRef(null);

  // Automatically mark rest days as completed (doesn't increase streak)
  useEffect(() => {
    const autoMarkRestDay = async () => {
      // Need user ID for calendar operations
      if (!user?.id || !isRestDay || !todaysWorkout) return;

      // Get today's date string
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // Create a unique key combining date and day number to detect day changes
      const restDayKey = `${todayStr}-day${todaysWorkout.dayNumber || 0}`;

      // Skip if we've already handled this specific rest day
      if (autoMarkedRestDayRef.current === restDayKey) return;

      try {
        // Check if today is already marked as a rest day locally
        const calendarData = await getCalendarData(user.id);
        const todayEntry = calendarData[todayStr];

        // Mark locally if not already marked as a rest day
        if (!todayEntry?.isRestDay) {
          // Mark today as a rest day via context (handles calendar + Progress refresh)
          // isRestDay=true means it won't count toward streak
          await markWorkoutCompleted('rest-day-auto', true);
        }

        // Always create/update DailyActivity record on backend (uses upsert, safe to call multiple times)
        try {
          await markRestDay(user.id, todayStr, {
            activityType: 'planned_rest',
            isPlanned: true,
            splitId: activeSplit?.id || null,
            dayNumber: todaysWorkout.dayNumber || null,
            plannedWorkoutName: todaysWorkout.dayName || 'Rest Day',
          });
        } catch (backendError) {
          // Don't fail if backend call fails
        }

        // Track that we've handled this specific rest day
        autoMarkedRestDayRef.current = restDayKey;
      } catch (error) {
        console.error('[Workout Tab] Error auto-marking rest day:', error);
      }
    };

    autoMarkRestDay();
  }, [isRestDay, todaysWorkout, user?.id, activeSplit?.id]);

  // Handle split that exists but hasn't been started
  const handleDaySelectedWrapper = async (dayIndex) => {
    if (isDaySelecting) return;
    setIsDaySelecting(true);
    try {
      await handleDaySelection(user?.id, dayIndex, activeSplit, markWorkoutCompleted, refreshTodaysWorkout);
      setShowChangeDayModal(false);
    } catch (error) {
      console.error('Failed to select day:', error);
      Alert.alert('Error', 'Failed to switch day. Please try again.');
    } finally {
      setIsDaySelecting(false);
    }
  };

  const openEditWorkout = () => {
    handleNavigation('/workout/edit', { type: 'split-day' });
  };

  // Load saved workouts for no-split and different workout modal
  useFocusEffect(
    useCallback(() => {
      const loadSavedWorkouts = async () => {
        try {
          const workouts = await getSavedWorkouts(user?.id);
          setSavedWorkouts(workouts || []);
        } catch (error) {
          console.error('[Workout] Error loading saved workouts:', error);
        }
      };
      if (user?.id) loadSavedWorkouts();
    }, [user?.id])
  );



  // Render the Change Day Modal - extracted to avoid duplication
  const renderChangeDayModal = () => (
    <Modal
      visible={showChangeDayModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowChangeDayModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Workout Day</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowChangeDayModal(false)}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.modalSubtitle, { color: colors.secondaryText }]}>
          Select which day you'd like to train today
        </Text>
        <ScrollView
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Day List */}
          {(activeSplit?.days || activeSplit?.workoutDays)?.map((day, index) => {
            const isRest = day.isRest;
            const dayName = isRest ? 'Rest Day' : (day.name || day.workoutName || day.dayName || `Day ${index + 1}`);
            let exerciseCount = 0;
            if (!isRest && day.exercises) {
              try {
                exerciseCount = typeof day.exercises === 'string'
                  ? JSON.parse(day.exercises).length
                  : Array.isArray(day.exercises) ? day.exercises.length : 0;
              } catch (e) {
                exerciseCount = 0;
              }
            }

            return (
              <TouchableOpacity
                key={index}
                style={[styles.dayPickerCard, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow, opacity: isDaySelecting ? 0.5 : 1 }]}
                onPress={() => handleDaySelectedWrapper(index)}
                activeOpacity={0.7}
                disabled={isDaySelecting}
              >
                <View style={styles.dayPickerCardContent}>
                  {day.emoji && <Text style={styles.dayPickerEmoji}>{day.emoji}</Text>}
                  <View style={styles.dayPickerInfo}>
                    <Text style={[styles.dayPickerName, { color: colors.text }]}>{dayName}</Text>
                    {!isRest && exerciseCount > 0 && (
                      <Text style={[styles.dayPickerExercises, { color: colors.secondaryText }]}>
                        {exerciseCount} exercises
                      </Text>
                    )}
                  </View>
                </View>
                {isRest && (
                  <View style={[styles.restDayBadge, { backgroundColor: colors.borderLight + '40' }]}>
                    <Ionicons name="moon" size={14} color={colors.secondaryText} />
                    <Text style={[styles.restDayBadgeText, { color: colors.secondaryText }]}>Rest</Text>
                  </View>
                )}
                {isDaySelecting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );

  // Show loading state while context initializes
  if (!isInitialized) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
          <Text style={[styles.title, { color: colors.text }]}>Today's Workout</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // Show Begin Split card if split exists but hasn't been started
  if (activeSplit && activeSplit.started === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
          <Text style={[styles.title, { color: colors.text }]}>Today's Workout</Text>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.contentContainer, responsiveStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        >
          <BeginSplitCard
            split={activeSplit}
            onDaySelected={handleDaySelectedWrapper}
          />
        </ScrollView>
      </View>
    );
  }

  // Handle case where user has no split at all
  if (!activeSplit) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[
          styles.headerContainer,
          { backgroundColor: colors.cardBackground, shadowColor: colors.shadow },
          individualWorkoutCompleted && styles.headerContainerCompleted
        ]}>
          <Text style={[
            styles.title,
            { color: colors.text },
            individualWorkoutCompleted && styles.titleCompleted
          ]}>Today's Workout</Text>
        </View>

        {/* Tab Toggle - My Split vs Individual */}
        <TabBar
          tabs={WORKOUT_TABS}
          activeTab={workoutMode}
          onTabPress={handleWorkoutModeChange}
          style={{ backgroundColor: colors.cardBackground }}
          completed={individualWorkoutCompleted}
          lockedTab={individualWorkoutCompleted ? 'individual' : null}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.noSplitScrollContent, responsiveStyle]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        >
          {workoutMode === 'individual' ? (
            individualWorkoutCompleted && completedIndividualWorkout ? (
              /* Show completed workout card */
              <View style={styles.contentContainer}>
                <IndividualWorkoutCompletedCard
                  workoutData={completedIndividualWorkout}
                  isPostProcessing={isPostProcessing}
                  onPostWorkout={() => {
                    // Format workout data like split workouts for consistent post creation
                    const workoutDataForPost = {
                      dayName: completedIndividualWorkout.workoutName || 'Workout',
                      exercises: completedIndividualWorkout.exercises || [],
                      source: completedIndividualWorkout.source || 'freestyle',
                    };
                    const badges = buildBadges({
                      streak: currentStreak,
                      prExercises: completedIndividualWorkout.newPRs || [],
                    });
                    handleNavigation('/post/create', {
                      workoutData: JSON.stringify(workoutDataForPost),
                      workoutSessionId: completedIndividualWorkout.workoutSessionId?.toString() || '',
                      badges: badges ? JSON.stringify(badges) : '',
                    });
                  }}
                  onUncomplete={async () => {
                    // If it was a saved workout, go back to the saved workout detail view
                    if (completedIndividualWorkout?.source === 'saved' && completedIndividualWorkout?.savedWorkoutId) {
                      const savedWorkout = savedWorkouts.find(w => w.id === completedIndividualWorkout.savedWorkoutId);
                      if (savedWorkout) {
                        setSelectedSavedWorkout(savedWorkout);
                      }
                    }
                    await markIndividualWorkoutCompleted(null);
                  }}
                />
              </View>
            ) : selectedSavedWorkout ? (
              /* Show selected saved workout detail */
              <SavedWorkoutDetailCard
                workout={selectedSavedWorkout}
                onBack={() => setSelectedSavedWorkout(null)}
                onEdit={(workout) => handleNavigation('/workout/make-workout', { editWorkoutId: workout.id })}
                onMarkComplete={async (workout) => {
                  setSelectedSavedWorkout(null);

                  (async () => {
                    try {
                      const workoutSessionId = await createCompletedWorkoutSession(user?.id, {
                        workoutName: workout.name,
                        exercises: workout.exercises || [],
                        source: 'saved',
                        savedWorkoutId: workout.id?.toString(),
                      });
                      const workoutData = {
                        source: 'saved',
                        workoutSessionId,
                        savedWorkoutId: workout.id,
                        workoutName: workout.name,
                        exercises: workout.exercises?.map(ex => ({
                          name: ex.name,
                          sets: ex.sets || 0,
                          reps: ex.reps || 0,
                        })) || [],
                        completedAt: Date.now(),
                      };
                      await manualSync();
                      await markIndividualWorkoutCompleted(workoutData);

                      // Show celebration immediately, calc streak during animation
                      setShowCelebration(true);
                      setIsPostProcessing(true);
                      try {
                        const streak = await calculateStreakFromLocal(user?.id, 'workout');
                        setCurrentStreak(streak);
                      } finally {
                        setIsPostProcessing(false);
                      }
                    } catch (error) {
                      console.error('[Workout Tab] Error marking workout complete:', error);
                    }
                  })();
                }}
              />
            ) : (
              /* Show freestyle/saved options */
              <>
                {/* Freestyle Workout Option */}
                <TouchableOpacity
                  style={[styles.freestyleCard, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}
                  onPress={() => handleNavigation('/workout/session', { source: 'freestyle' })}
                  activeOpacity={0.8}
                  disabled={isNavigatingRef.current}
                >
                  <View style={[styles.freestyleIconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="flash" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.freestyleContent}>
                    <Text style={[styles.freestyleTitle, { color: colors.text }]}>Start Freestyle Workout</Text>
                    <Text style={[styles.freestyleSubtitle, { color: colors.secondaryText }]}>
                      Add exercises as you go
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
                </TouchableOpacity>

                {/* Saved Workouts Section */}
                {savedWorkouts.length > 0 ? (
                  <View style={styles.savedWorkoutsSection}>
                    <Text style={[styles.savedWorkoutsSectionTitle, { color: colors.text }]}>
                      Saved Workouts
                    </Text>
                    <SavedWorkoutPicker
                      workouts={savedWorkouts}
                      onSelect={(workout) => setSelectedSavedWorkout(workout)}
                    />
                  </View>
                ) : (
                  <View style={styles.createSplitSection}>
                    <View style={[styles.noSplitCard, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
                      <Ionicons name="barbell-outline" size={48} color={colors.secondaryText} style={{ marginBottom: 16 }} />
                      <Text style={[styles.noSplitTitle, { color: colors.text }]}>No Saved Workouts</Text>
                      <Text style={[styles.noSplitSubtitle, { color: colors.secondaryText }]}>
                        Create a custom workout to reuse anytime
                      </Text>
                      <TouchableOpacity
                        style={[styles.createSplitButtonPrimary, { backgroundColor: colors.primary }]}
                        onPress={() => handleNavigation('/workout/make-workout')}
                        disabled={isNavigatingRef.current}
                      >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.createSplitButtonPrimaryText}>Create a Workout</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )
          ) : (
            /* My Split Tab - No split created yet */
            <View style={styles.createSplitSection}>
              <View style={[styles.noSplitCard, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
                <Ionicons name="calendar-outline" size={48} color={colors.secondaryText} style={{ marginBottom: 16 }} />
                <Text style={[styles.noSplitTitle, { color: colors.text }]}>No Workout Split</Text>
                <Text style={[styles.noSplitSubtitle, { color: colors.secondaryText }]}>
                  Create a workout split to follow a structured weekly plan
                </Text>
                <TouchableOpacity
                  style={[styles.createSplitButtonPrimary, { backgroundColor: colors.primary }]}
                  onPress={() => handleNavigation('/program')}
                  disabled={isNavigatingRef.current}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.createSplitButtonPrimaryText}>Create a Workout Split</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Celebration Animation for individual workout completion */}
        {showCelebration && (
          <CelebrationAnimation
            onAnimationComplete={() => {
              setShowCelebration(false);
            }}
          />
        )}
      </View>
    );
  }

  // Handle case where split exists but workout is still being calculated
  if (!todaysWorkout) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
          <Text style={[styles.title, { color: colors.text }]}>Today's Workout</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // Show Rest Day Card for rest days
  if (isRestDay) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerContainer, styles.headerContainerCompleted]}>
          <Text style={[styles.title, styles.titleCompleted]}>Today's Workout</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={responsiveStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        >
          <View style={styles.contentContainer}>
            <RestDayCard
              splitName={activeSplit?.name}
              splitEmoji={activeSplit?.emoji}
              weekNumber={todaysWorkout.weekNumber}
              dayNumber={todaysWorkout.dayNumber}
              onRestLogged={() => {
                // Mark calendar as rest day completed (no celebration for rest days)
                markWorkoutCompleted('rest-day-logged', true);
              }}
              onChangeWorkout={() => setShowChangeDayModal(true)}
            />
          </View>
        </ScrollView>

        {/* Celebration Animation */}
        {showCelebration && (
          <CelebrationAnimation
            onAnimationComplete={() => {
              setShowCelebration(false);
              setIsToggling(false);
            }}
          />
        )}

        {/* Change Workout Modal - rendered here for rest day view */}
        {renderChangeDayModal()}
      </View>
    );
  }

  // Show Free Rest Day Card when a free rest day has been taken today
  if (todaysWorkoutCompleted && completedSessionId === 'free-rest-day') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerContainer, { backgroundColor: colors.warning }]}>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>Today's Workout</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={responsiveStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        >
          <View style={styles.contentContainer}>
            <FreeRestDayCard
              splitName={activeSplit?.name}
              splitEmoji={activeSplit?.emoji}
              weekNumber={todaysWorkout?.weekNumber}
              dayNumber={todaysWorkout?.dayNumber}
              originalWorkoutName={todaysWorkout?.dayName}
              onRestLogged={() => {
                // Mark as completed so the card doesn't keep showing
                // Keep session ID as 'free-rest-day' to match the UI check on line 714
                markWorkoutCompleted('free-rest-day', true);
              }}
              onUndoRestDay={() => {
                Alert.alert(
                  'Undo Free Rest Day?',
                  'This will restore your free rest day for this week and you can resume your workout.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Undo',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await markWorkoutCompleted(null);
                          await clearFreeRestDayUsageForToday();
                          await AsyncStorage.removeItem('freeRestDayDate');
                          setFreeRestDayAvailable(true);
                        } catch (error) {
                          console.error('[Workout Tab] Error undoing free rest day:', error);
                          Alert.alert('Error', 'Failed to undo free rest day. Please try again.');
                        }
                      },
                    },
                  ]
                );
              }}
            />
          </View>
        </ScrollView>

        {/* Celebration Animation */}
        {showCelebration && (
          <CelebrationAnimation
            onAnimationComplete={() => {
              setShowCelebration(false);
              setIsToggling(false);
            }}
          />
        )}
      </View>
    );
  }

  // Wrapper for handleToggleCompletion from hook with celebration logic
  const handleToggleCompletionWrapper = async () => {
    if (!isCompleted) {
      const workoutId = await handleToggleCompletion(isCompleted);
      if (workoutId) {
        // Show celebration immediately, calc streak during animation
        setShowCelebration(true);
        setIsPostProcessing(true);
        try {
          const streak = await calculateStreakFromLocal(user?.id, 'workout');
          setCurrentStreak(streak);
        } finally {
          setIsPostProcessing(false);
        }
      }
    } else {
      // Un-complete path
      await handleToggleCompletion(isCompleted);
      try {
        const streak = await calculateStreakFromLocal(user?.id);
        setCurrentStreak(streak);
      } catch (error) {
        console.error('[Workout Tab] Error recalculating streak:', error);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.headerContainer,
        { backgroundColor: colors.cardBackground, shadowColor: colors.shadow },
        ((isCompleted && workoutMode === 'split') || (individualWorkoutCompleted && workoutMode === 'individual')) && styles.headerContainerCompleted
      ]}>
        <Text style={[
          styles.title,
          { color: colors.text },
          ((isCompleted && workoutMode === 'split') || (individualWorkoutCompleted && workoutMode === 'individual')) && styles.titleCompleted
        ]}>Today's Workout</Text>
      </View>

      {/* Tab Toggle - My Split vs Individual */}
      <TabBar
        tabs={WORKOUT_TABS}
        activeTab={workoutMode}
        onTabPress={handleWorkoutModeChange}
        style={{ backgroundColor: colors.cardBackground }}
        completed={isCompleted || individualWorkoutCompleted}
        lockedTab={isCompleted ? 'split' : (individualWorkoutCompleted ? 'individual' : null)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={responsiveStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {workoutMode === 'split' ? (
          <View style={styles.contentContainer}>
            <SplitWorkoutCard
              todaysWorkout={todaysWorkout}
              activeSplit={activeSplit}
              isCompleted={isCompleted}
              isToggling={isToggling}
              hasExercises={todaysWorkout?.exercises?.length > 0}
              hasActiveWorkout={hasActiveWorkout}
              currentStreak={currentStreak}
              completedSessionId={completedSessionId}
              completedWorkoutData={completedSplitWorkout}
              shouldCollapse={shouldCollapse}
              maxVisibleExercises={maxVisibleExercises}
              freeRestDayAvailable={freeRestDayAvailable}
              onToggleCompletion={handleToggleCompletionWrapper}
              onChangeDayPress={() => setShowChangeDayModal(true)}
              onEditWorkoutPress={openEditWorkout}
              onFreeRestDayPress={() => {
                Alert.alert(
                  'Take Free Rest Day?',
                  'You are only allowed one free rest day per week. This will use yours for this week. Your current workout will be waiting tomorrow.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Take Rest Day',
                      onPress: async () => {
                        await markFreeRestDay();
                        setFreeRestDayAvailable(false);
                      },
                    },
                  ]
                );
              }}
              skipAutoResumeRef={skipAutoResumeRef}
              isPostProcessing={isPostProcessing}
            />
          </View>
        ) : (
          <IndividualWorkoutView
            individualWorkoutCompleted={individualWorkoutCompleted}
            completedIndividualWorkout={completedIndividualWorkout}
            savedWorkouts={savedWorkouts}
            selectedSavedWorkout={selectedSavedWorkout}
            currentStreak={currentStreak}
            isPostProcessing={isPostProcessing}
            onUncomplete={async () => {
              // If it was a saved workout, go back to the saved workout detail view
              if (completedIndividualWorkout?.source === 'saved' && completedIndividualWorkout?.savedWorkoutId) {
                const savedWorkout = savedWorkouts.find(w => w.id === completedIndividualWorkout.savedWorkoutId);
                if (savedWorkout) {
                  setSelectedSavedWorkout(savedWorkout);
                }
              }
              await markIndividualWorkoutCompleted(null);
            }}
            onEditWorkout={(workout) => handleNavigation('/workout/make-workout', { editWorkoutId: workout.id })}
            onSelectWorkout={(workout) => setSelectedSavedWorkout(workout)}
            onBackFromWorkout={() => setSelectedSavedWorkout(null)}
            onMarkComplete={async (workout) => {
              setSelectedSavedWorkout(null);

              (async () => {
                try {
                  const workoutSessionId = await createCompletedWorkoutSession(user?.id, {
                    workoutName: workout.name,
                    exercises: workout.exercises || [],
                    source: 'saved',
                    savedWorkoutId: workout.id?.toString(),
                  });
                  const workoutData = {
                    source: 'saved',
                    workoutSessionId,
                    savedWorkoutId: workout.id,
                    workoutName: workout.name,
                    exercises: workout.exercises?.map(ex => ({
                      name: ex.name,
                      sets: ex.sets || 0,
                      reps: ex.reps || 0,
                    })) || [],
                    completedAt: Date.now(),
                  };
                  await manualSync();
                  await markIndividualWorkoutCompleted(workoutData);

                  // Show celebration immediately, calc streak during animation
                  setShowCelebration(true);
                  setIsPostProcessing(true);
                  try {
                    const streak = await calculateStreakFromLocal(user?.id, 'workout');
                    setCurrentStreak(streak);
                  } finally {
                    setIsPostProcessing(false);
                  }
                } catch (error) {
                  console.error('[Workout Tab] Error marking workout complete:', error);
                }
              })();
            }}
          />
        )}
      </ScrollView>

      {/* Change Workout Modal - shared instance */}
      {renderChangeDayModal()}

      {/* Celebration Animation */}
      {showCelebration && (
        <CelebrationAnimation
          onAnimationComplete={() => {
            setShowCelebration(false);
            setIsToggling(false);
          }}
        />
      )}
    </View>
  );
};

export default WorkoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 0,
  },
  headerContainerCompleted: {
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  titleCompleted: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 20,
    flex: 1,
    alignItems: 'stretch',
  },

  // Workout Card (matching Activity card styling)
  workoutCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 0,
    width: '100%',
  },
  workoutCardCompleted: {
    backgroundColor: '#4CAF50' + '08',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.15,
  },

  // Workout Header
  workoutHeader: {
    marginBottom: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  splitName: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  workoutTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  exerciseCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  cycleInfo: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Exercises List
  exercisesList: {
    marginTop: 4,
  },
  exerciseItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  exerciseContent: {
    gap: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  exerciseDetailText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Show More Button
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    marginTop: 2,
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty state
  emptyScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
    maxWidth: 400,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptyStateMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateCTAText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Action Buttons Container
  actionButtons: {
    marginTop: 20,
    gap: 10,
  },

  // No exercises warning
  noExercisesWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  noExercisesWarningText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },

  // Primary CTA - Start Workout Button
  startWorkoutButton: {
    paddingVertical: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startWorkoutButtonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  startWorkoutText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  startWorkoutTextDisabled: {
    opacity: 0.8,
  },

  // Secondary Action Button (Mark Complete / Un-complete)
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    paddingVertical: 14,
    borderRadius: 16,
  },
  secondaryActionButtonDisabled: {
    opacity: 0.5,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Post Workout Button
  postWorkoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  postWorkoutButtonDisabled: {
    opacity: 0.5,
  },
  postWorkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  postWorkoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // Header Actions (exercise count + options button)
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Options Button (3-dot menu)
  optionsButton: {
    padding: 4,
    borderRadius: 20,
  },

  // Options Menu Backdrop (invisible overlay to dismiss)
  optionsMenuBackdrop: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    zIndex: 999,
  },

  // Options Menu Overlay
  optionsMenuOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    borderRadius: 20,
    padding: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 220,
    zIndex: 1000,
  },

  // Options Menu Item
  optionsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  // Options Menu Item Text
  optionsMenuItemText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Modal Container
  modalContainer: {
    flex: 1,
  },

  // Modal Header
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Modal Title
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },

  // Modal Close Button
  modalCloseButton: {
    padding: 4,
  },

  // Modal ScrollView
  modalScrollView: {
    flex: 1,
  },

  // Modal Content
  modalContent: {
    padding: 20,
  },

  // Modal Subtitle
  modalSubtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  // Day Picker Card
  dayPickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Day Picker Card Content
  dayPickerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  // Day Picker Emoji
  dayPickerEmoji: {
    fontSize: 24,
  },

  // Day Picker Info
  dayPickerInfo: {
    flex: 1,
  },

  // Day Picker Name
  dayPickerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },

  // Day Picker Exercises
  dayPickerExercises: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Rest Day Badge
  restDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
  },

  // Rest Day Badge Text
  restDayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // No-Split Freestyle Workout UI
  noSplitScrollContent: {
    paddingHorizontal: 6,
    paddingTop: 12,
    paddingBottom: 40,
  },
  freestyleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    borderWidth: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  freestyleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  freestyleContent: {
    flex: 1,
  },
  freestyleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  freestyleSubtitle: {
    fontSize: 13,
  },
  savedWorkoutsSection: {
    marginTop: 28,
  },
  savedWorkoutsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createSplitSection: {
    marginTop: 36,
    alignItems: 'center',
  },
  // No Split Card styles
  noSplitCard: {
    borderRadius: 20,
    borderWidth: 0,
    padding: 28,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  noSplitTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  noSplitSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  createSplitButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  createSplitButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});