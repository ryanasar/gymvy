import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initializeApp, storage, migrateUserStorage } from '@/services/storage';
import { useAuth } from '@/lib/auth';
import { getSplitsByUserId } from "@/services/api/splits";
import { getCustomExercises } from '@/services/api/customExercises';
import { checkNetworkStatus } from '@/services/network/networkService';
import { markRestDay } from '@/services/api/dailyActivity';

const WorkoutContext = createContext();

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

export const WorkoutProvider = ({ children }) => {
  const { user } = useAuth();

  // State from storage layer
  const [activeSplit, setActiveSplit] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(3);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [lastWorkoutCompleted, setLastWorkoutCompleted] = useState(null);
  const [lastCompletionDate, setLastCompletionDate] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [todaysWorkoutCompleted, setTodaysWorkoutCompleted] = useState(false);
  const [completedSessionId, setCompletedSessionId] = useState(null);
  const [exerciseDatabase, setExerciseDatabase] = useState({});

  // Individual workout completion state (freestyle/saved workouts)
  const [individualWorkoutCompleted, setIndividualWorkoutCompleted] = useState(false);
  const [completedIndividualWorkout, setCompletedIndividualWorkout] = useState(null);

  // Split workout completion state (actual session data, not template)
  const [completedSplitWorkout, setCompletedSplitWorkout] = useState(null);

  // Helper function to validate and fix exerciseIds in split
  const validateAndFixSplitExercises = (split, exerciseMap) => {
    // Create a name-to-id map for fallback matching
    const nameToIdMap = {};
    Object.values(exerciseMap).forEach(ex => {
      nameToIdMap[ex.name.toLowerCase()] = ex.id;
    });

    let needsUpdate = false;
    const updatedDays = split.days?.map(day => {
      if (day.isRest || !day.exercises) return day;

      const validatedExercises = day.exercises.map(ex => {
        // Normalize exerciseId - handle both exerciseId and id field names
        const rawId = ex.exerciseId || ex.id;
        const exerciseIdStr = String(rawId);
        const exerciseIdNum = parseInt(rawId);

        // Ensure targetSets, targetReps, and restSeconds have valid values
        const targetSets = parseInt(ex.targetSets) || parseInt(ex.sets) || 3;
        const targetReps = ex.targetReps != null ? parseInt(ex.targetReps) : (ex.reps != null ? parseInt(ex.reps) : null);
        const restSeconds = parseInt(ex.restSeconds) || 0;

        // Check if values were missing and need fixing
        if (!ex.targetSets || !ex.targetReps || !ex.exerciseId) {
          needsUpdate = true;
        }

        // Check if this exerciseId exists in local database (try both string and number)
        if (exerciseMap[exerciseIdStr] || exerciseMap[exerciseIdNum]) {
          return { ...ex, exerciseId: exerciseIdStr, targetSets, targetReps, restSeconds };
        }

        // Exercise ID not found - try to match by name
        if (ex.name) {
          const matchedId = nameToIdMap[ex.name.toLowerCase()];
          if (matchedId) {
            needsUpdate = true;
            return { ...ex, exerciseId: String(matchedId), targetSets, targetReps, restSeconds };
          }
        }

        // Could not match - keep original but flag for update
        needsUpdate = true;
        return { ...ex, exerciseId: exerciseIdStr, targetSets, targetReps, restSeconds };
      }).filter(ex => {
        // Filter out exercises that couldn't be matched and don't exist
        const idStr = String(ex.exerciseId);
        const idNum = parseInt(ex.exerciseId);
        return exerciseMap[idStr] || exerciseMap[idNum];
      });

      return { ...day, exercises: validatedExercises };
    });

    if (needsUpdate) {
      return { ...split, days: updatedDays, needsSave: true };
    }
    return split;
  };

  // Initialize app with storage layer
  useEffect(() => {
    const initializeWorkoutContext = async () => {
      try {
        const userId = user?.id;

        // Run migration for legacy keys if user is logged in
        if (userId) {
          await migrateUserStorage(userId);
        }

        // Initialize the storage layer with userId
        const appState = await initializeApp(userId);

        // Load exercise database for mapping IDs to names (bundled only initially)
        // Custom exercises are fetched from backend later
        const exercises = await storage.getExercises();
        const exerciseMap = {};
        exercises.forEach(ex => {
          exerciseMap[ex.id] = ex;
        });
        setExerciseDatabase(exerciseMap);

        if (appState.split) {
          // Use split from storage

          // Check if split needs migration from old format
          if (appState.split.workoutDays && !appState.split.days) {
            const migratedSplit = {
              ...appState.split,
              days: appState.split.workoutDays.map((day, index) => ({
                dayIndex: index,
                name: day.name || day.workoutName,
                type: day.type || day.workoutType,
                emoji: day.emoji,
                isRest: day.isRest || false,
                exercises: (day.exercises || [])
                  .map(ex => {
                    // Normalize exerciseId to a number to match local database
                    const rawId = ex.id || ex.exerciseId || ex.name;
                    const exerciseId = parseInt(rawId) || rawId;
                    return {
                      exerciseId: exerciseId,
                      targetSets: parseInt(ex.sets || ex.targetSets) || 3,
                      targetReps: (ex.reps ?? ex.targetReps) != null ? parseInt(ex.reps || ex.targetReps) : null,
                      restSeconds: parseInt(ex.restSeconds) || 0,
                    };
                  })
                  .filter(ex => ex.exerciseId && ex.exerciseId !== 'undefined'), // Filter out invalid exercises
              })),
            };
            delete migratedSplit.workoutDays;

            // Validate and fix exercise IDs
            const validatedSplit = validateAndFixSplitExercises(migratedSplit, exerciseMap);
            if (validatedSplit.needsSave && userId) {
              await storage.saveSplit(userId, validatedSplit);
            } else if (userId) {
              await storage.saveSplit(userId, migratedSplit);
            }
            setActiveSplit(validatedSplit);
          } else {
            // Validate exercise IDs match local database
            const validatedSplit = validateAndFixSplitExercises(appState.split, exerciseMap);

            if (validatedSplit.needsSave && userId) {
              await storage.saveSplit(userId, validatedSplit);
            }

            // Check if the split is corrupted (has invalid exercises)
            const hasCorruptedExercises = validatedSplit.days?.some(day =>
              day.exercises?.some(ex => !ex.exerciseId || ex.exerciseId === 'undefined' || ex.targetSets === undefined)
            );

            if (hasCorruptedExercises && validatedSplit.userId) {
              try {
                const { reloadSplitFromBackend } = await import('@/utils/clearLocalSplit');
                const reloadedSplit = await reloadSplitFromBackend(validatedSplit.id, validatedSplit.userId);

                if (reloadedSplit) {
                  // Validate the reloaded split too
                  const revalidatedSplit = validateAndFixSplitExercises(reloadedSplit, exerciseMap);
                  if (revalidatedSplit.needsSave && userId) {
                    await storage.saveSplit(userId, revalidatedSplit);
                  }
                  setActiveSplit(revalidatedSplit);
                } else {
                  setActiveSplit(validatedSplit);
                }
              } catch (error) {
                setActiveSplit(validatedSplit);
              }
            } else {
              setActiveSplit(validatedSplit);
            }
          }
        } else {
          // No split in storage - leave as null
          setActiveSplit(null);
        }

        // Only load progress if we have an active split
        if (appState.split) {
          const savedWeek = await AsyncStorage.getItem('currentWeek');
          const savedDayIndex = await AsyncStorage.getItem('currentDayIndex');
          const savedCompletionDate = await AsyncStorage.getItem('lastCompletionDate');
          const savedLastCheckDate = await AsyncStorage.getItem('lastCheckDate');
          const savedSessionId = await AsyncStorage.getItem('completedSessionId');

          let currentWeekValue = savedWeek ? parseInt(savedWeek) : 1;
          let currentDayValue = savedDayIndex ? parseInt(savedDayIndex) : 0;

          setCurrentWeek(currentWeekValue);
          setCurrentDayIndex(currentDayValue);
          if (savedCompletionDate) setLastCompletionDate(savedCompletionDate);

          // Check if we need to advance to next day (existing logic)
          const today = getLocalDateString();

          // MIGRATION: Fix any UTC dates stored before the timezone fix
          // If stored date is in the future (UTC vs local timezone issue), reset to today
          let dateToCheck = savedLastCheckDate;
          const hadFutureDateBug = dateToCheck && dateToCheck > today;

          if (hadFutureDateBug) {
            dateToCheck = today;
            await AsyncStorage.setItem('lastCheckDate', today);

            // If completion date is also in future, it means the workout might have been
            // incorrectly advanced. Reset completion date to today.
            if (savedCompletionDate && savedCompletionDate > today) {
              await AsyncStorage.setItem('lastCompletionDate', today);
              setLastCompletionDate(today);

              // If today's workout was marked complete but day index advanced incorrectly,
              // go back one day to fix it
              if (currentDayValue > 0) {
                currentDayValue = currentDayValue - 1;
                setCurrentDayIndex(currentDayValue);
                await AsyncStorage.setItem('currentDayIndex', currentDayValue.toString());
              } else if (currentDayValue === 0 && currentWeekValue > 1) {
                // If we're on day 0, go back to last day of previous week
                const totalDays = appState.split?.totalDays || 6;
                currentDayValue = totalDays - 1;
                currentWeekValue = currentWeekValue - 1;
                setCurrentDayIndex(currentDayValue);
                setCurrentWeek(currentWeekValue);
                await AsyncStorage.setItem('currentDayIndex', currentDayValue.toString());
                await AsyncStorage.setItem('currentWeek', currentWeekValue.toString());
              }
            }
          }

          if (!dateToCheck && savedCompletionDate) {
            dateToCheck = savedCompletionDate;
          }

          if (dateToCheck && dateToCheck < today) {
            const wasLastDayCompleted = savedCompletionDate === dateToCheck;
            const freeRestDayDate = await AsyncStorage.getItem('freeRestDayDate');
            const wasFreeRestDay = freeRestDayDate === dateToCheck;
            const elapsed = daysBetween(dateToCheck, today);

            const result = computeAdvancedDay(
              currentDayValue, currentWeekValue, appState.split,
              elapsed, wasLastDayCompleted, wasFreeRestDay, dateToCheck
            );

            if (result.didAdvance) {
              currentDayValue = result.dayIndex;
              currentWeekValue = result.week;
              setCurrentDayIndex(currentDayValue);
              setCurrentWeek(currentWeekValue);
              await AsyncStorage.setItem('currentDayIndex', currentDayValue.toString());
              await AsyncStorage.setItem('currentWeek', currentWeekValue.toString());
            }

            // Record skipped rest days to backend (fire-and-forget)
            if (result.skippedRestDays.length > 0 && user?.id) {
              for (const restDay of result.skippedRestDays) {
                try {
                  await markRestDay(user.id, restDay.date, {
                    activityType: 'planned_rest',
                    isPlanned: true,
                    splitId: appState.split.id,
                    dayNumber: restDay.dayIndex + 1,
                    plannedWorkoutName: restDay.dayName,
                  });
                } catch (e) {
                  // Non-critical — don't block advancement
                }
              }
            }

            if (freeRestDayDate) {
              await AsyncStorage.removeItem('freeRestDayDate');
            }

            setTodaysWorkoutCompleted(false);
            setCompletedSessionId(null);
            await AsyncStorage.removeItem('completedSessionId');
          } else if (savedCompletionDate === today && savedLastCheckDate === today && savedSessionId) {
            // Restore today's completion state if workout was completed today
            setTodaysWorkoutCompleted(true);
            setCompletedSessionId(savedSessionId === 'free-rest-day' ? 'free-rest-day' : parseInt(savedSessionId));
          }

          await AsyncStorage.setItem('lastCheckDate', today);
        }

        // Restore individual workout completion state if completed today
        const individualDate = await AsyncStorage.getItem('individualWorkoutDate');
        const todayForIndividual = getLocalDateString();
        if (individualDate === todayForIndividual) {
          const individualCompleted = await AsyncStorage.getItem('individualWorkoutCompleted');
          const individualWorkoutData = await AsyncStorage.getItem('completedIndividualWorkout');
          if (individualCompleted === 'true' && individualWorkoutData) {
            setIndividualWorkoutCompleted(true);
            setCompletedIndividualWorkout(JSON.parse(individualWorkoutData));
          }
        } else if (individualDate && individualDate < todayForIndividual) {
          // Clear stale individual workout data from previous day
          await AsyncStorage.multiRemove(['individualWorkoutCompleted', 'completedIndividualWorkout', 'individualWorkoutDate']);
        }

        // Restore completed split workout data if completed today
        const splitWorkoutDate = await AsyncStorage.getItem('completedSplitWorkoutDate');
        if (splitWorkoutDate === todayForIndividual) {
          const splitWorkoutData = await AsyncStorage.getItem('completedSplitWorkout');
          if (splitWorkoutData) {
            setCompletedSplitWorkout(JSON.parse(splitWorkoutData));
          }
        } else if (splitWorkoutDate && splitWorkoutDate < todayForIndividual) {
          // Clear stale split workout data from previous day
          await AsyncStorage.multiRemove(['completedSplitWorkout', 'completedSplitWorkoutDate']);
        }

        setIsInitialized(true);

      } catch (error) {
        console.error('[WorkoutContext] Failed to initialize:', error);
        setIsInitialized(true); // Still mark as initialized to prevent blocking UI
      }
    };

    initializeWorkoutContext();
  }, [user?.id]);

  // Fetch custom exercises from backend on startup
  useEffect(() => {
    if (!isInitialized || !user?.id) return;

    const fetchCustomExercisesOnStartup = async () => {
      try {
        const isOnline = await checkNetworkStatus();
        if (!isOnline) return;

        // Fetch from backend (no local cache)
        const customExercises = await getCustomExercises(user.id);

        // Add custom exercises to the exercise database
        setExerciseDatabase(prev => {
          const updated = { ...prev };
          customExercises.forEach(ex => {
            updated[String(ex.id)] = { ...ex, isCustom: true };
          });
          return updated;
        });
      } catch (error) {
        console.error('[WorkoutContext] Custom exercise fetch failed:', error);
      }
    };

    fetchCustomExercisesOnStartup();
  }, [isInitialized, user?.id]);

  // Fetch splits from backend if none found locally after init
  // IMPORTANT: This should restore the split WITHOUT resetting progress
  useEffect(() => {
    if (!isInitialized || activeSplit || !user?.id) return;

    const fetchAndActivateSplit = async () => {
      try {
        const splits = await getSplitsByUserId(user.id);
        if (splits && splits.length > 0) {
          const split = splits[0];
          const formatted = {
            id: split.id,
            name: split.name,
            totalDays: split.numDays,
            emoji: split.emoji,
            isActive: true,
            description: split.description,
            started: split.started,
            isPublic: split.isPublic,
            workoutDays: split.workoutDays,
            days: split.workoutDays.map((day, index) => ({
              dayIndex: index,
              name: day.workoutName,
              type: day.workoutType,
              emoji: day.emoji,
              isRest: day.isRest,
              exercises: day.exercises || [],
            })),
          };

          // Restore split WITHOUT resetting progress (day/week)
          // Progress reset should only happen when explicitly changing to a DIFFERENT split
          setActiveSplit(formatted);
          await storage.saveSplit(user.id, formatted);

          // Restore saved progress if available (don't reset to 0)
          const savedWeek = await AsyncStorage.getItem('currentWeek');
          const savedDayIndex = await AsyncStorage.getItem('currentDayIndex');
          if (savedWeek) setCurrentWeek(parseInt(savedWeek));
          if (savedDayIndex) setCurrentDayIndex(parseInt(savedDayIndex));
        }
      } catch (error) {
        console.error('[WorkoutContext] Failed to fetch splits from backend:', error);
      }
    };

    fetchAndActivateSplit();
  }, [isInitialized, activeSplit, user?.id]);

  // Helper to get today's date in local timezone (YYYY-MM-DD format)
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Compute calendar days between two YYYY-MM-DD strings
  const daysBetween = (dateStrA, dateStrB) => {
    const [yA, mA, dA] = dateStrA.split('-').map(Number);
    const [yB, mB, dB] = dateStrB.split('-').map(Number);
    const a = new Date(yA, mA - 1, dA);
    const b = new Date(yB, mB - 1, dB);
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
  };

  // Add N days to a YYYY-MM-DD string and return the resulting YYYY-MM-DD string
  const addDaysToDateString = (dateStr, n) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + n);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Shared advancement logic: advance through elapsed days, auto-skipping rest days
  // Returns { dayIndex, week, didAdvance, skippedRestDays }
  const computeAdvancedDay = (startDayIndex, startWeek, split, elapsedDays, wasCompleted, wasFreeRestDay, lastCheckDate) => {
    const totalDays = split.totalDays;
    let dayIndex = startDayIndex;
    let week = startWeek;
    let didAdvance = false;
    const skippedRestDays = [];

    // Cap iterations to prevent infinite loops
    const maxIterations = Math.min(elapsedDays, totalDays);

    for (let i = 0; i < maxIterations; i++) {
      const currentDayData = split.days?.[dayIndex % totalDays];
      const isCurrentDayRest = currentDayData?.isRest === true;

      if (i === 0) {
        // First iteration: advance if last day was completed (and not free rest) OR current day is rest
        if ((wasCompleted && !wasFreeRestDay) || isCurrentDayRest) {
          // If it's a rest day we're advancing past, record it
          if (isCurrentDayRest) {
            skippedRestDays.push({
              date: addDaysToDateString(lastCheckDate, i + 1),
              dayIndex: dayIndex % totalDays,
              dayName: currentDayData?.name || 'Rest Day',
            });
          }
          const nextDayIndex = (dayIndex + 1) % totalDays;
          if (nextDayIndex === 0) week = week + 1;
          dayIndex = nextDayIndex;
          didAdvance = true;
        } else {
          // Workout wasn't completed and wasn't a rest day — stop
          break;
        }
      } else {
        // Subsequent iterations: only auto-advance through rest days
        const nextDayData = split.days?.[dayIndex % totalDays];
        if (nextDayData?.isRest === true) {
          skippedRestDays.push({
            date: addDaysToDateString(lastCheckDate, i + 1),
            dayIndex: dayIndex % totalDays,
            dayName: nextDayData?.name || 'Rest Day',
          });
          const nextDayIndex = (dayIndex + 1) % totalDays;
          if (nextDayIndex === 0) week = week + 1;
          dayIndex = nextDayIndex;
        } else {
          // Hit a workout day — stop advancing
          break;
        }
      }
    }

    return { dayIndex, week, didAdvance, skippedRestDays };
  };

  // Check for date changes while app is open
  useEffect(() => {
    if (!isInitialized || !activeSplit) return;

    const checkDateChange = async () => {
      try {
        const savedLastCheckDate = await AsyncStorage.getItem('lastCheckDate');
        const savedCompletionDate = await AsyncStorage.getItem('lastCompletionDate');
        const today = getLocalDateString();

        if (savedLastCheckDate && savedLastCheckDate < today) {
          const wasLastDayCompleted = savedCompletionDate === savedLastCheckDate;
          const freeRestDayDate = await AsyncStorage.getItem('freeRestDayDate');
          const wasFreeRestDay = freeRestDayDate === savedLastCheckDate;
          const elapsed = daysBetween(savedLastCheckDate, today);

          // Read current progress from storage to avoid stale state
          const savedDayIdx = await AsyncStorage.getItem('currentDayIndex');
          const savedWeekVal = await AsyncStorage.getItem('currentWeek');
          let tempDayIndex = savedDayIdx ? parseInt(savedDayIdx) : currentDayIndex;
          let tempWeek = savedWeekVal ? parseInt(savedWeekVal) : currentWeek;

          const result = computeAdvancedDay(
            tempDayIndex, tempWeek, activeSplit,
            elapsed, wasLastDayCompleted, wasFreeRestDay, savedLastCheckDate
          );

          if (result.didAdvance) {
            setCurrentDayIndex(result.dayIndex);
            setCurrentWeek(result.week);
            await AsyncStorage.setItem('currentDayIndex', result.dayIndex.toString());
            await AsyncStorage.setItem('currentWeek', result.week.toString());
          }

          // Record skipped rest days to backend (fire-and-forget)
          if (result.skippedRestDays.length > 0 && user?.id) {
            for (const restDay of result.skippedRestDays) {
              try {
                await markRestDay(user.id, restDay.date, {
                  activityType: 'planned_rest',
                  isPlanned: true,
                  splitId: activeSplit.id,
                  dayNumber: restDay.dayIndex + 1,
                  plannedWorkoutName: restDay.dayName,
                });
              } catch (e) {
                // Non-critical — don't block advancement
              }
            }
          }

          if (freeRestDayDate) {
            await AsyncStorage.removeItem('freeRestDayDate');
          }

          setTodaysWorkoutCompleted(false);
          setCompletedSessionId(null);
          setCompletedSplitWorkout(null);
          await AsyncStorage.multiRemove(['completedSessionId', 'completedSplitWorkout', 'completedSplitWorkoutDate']);
          await AsyncStorage.setItem('lastCheckDate', today);
        }
      } catch (error) {
        console.error('[WorkoutContext] Error checking date change:', error);
      }
    };

    checkDateChange();
    const interval = setInterval(checkDateChange, 60000);

    return () => clearInterval(interval);
  }, [isInitialized, activeSplit, currentDayIndex]);

  // Calculate today's workout
  const getTodaysWorkout = useCallback(() => {
    // Return null if no active split - show empty state in UI
    if (!activeSplit || !activeSplit.days) {
      return null;
    }

    const todaysDayIndex = currentDayIndex % activeSplit.totalDays;
    const todaysWorkoutDay = activeSplit.days[todaysDayIndex];

    if (!todaysWorkoutDay) return null;

    // Handle rest days
    if (todaysWorkoutDay.isRest) {
      return {
        title: `Rest Day — Week ${currentWeek} Day ${todaysDayIndex + 1}`,
        dayName: 'Rest Day',
        type: 'rest',
        isRest: true,
        exercises: [],
        weekNumber: currentWeek,
        dayNumber: todaysDayIndex + 1,
        totalDays: activeSplit.totalDays,
        splitId: activeSplit.id,
      };
    }

    const workoutName = todaysWorkoutDay.name || todaysWorkoutDay.workoutName || `Day ${todaysDayIndex + 1}`;
    const workoutType = todaysWorkoutDay.type || todaysWorkoutDay.workoutType;

    // Convert new storage format (exerciseId, targetSets, targetReps) to UI format (name, sets, reps)
    const exercises = (todaysWorkoutDay.exercises || []).map(exercise => {
      // If it's already in the old format (has 'name' property), return as-is
      if (exercise.name) {
        return exercise;
      }

      // New format: has exerciseId, targetSets, targetReps
      // Look up the exercise name from the exercise database
      // Convert exerciseId to string for consistent lookup (database stores IDs as strings)
      const exerciseIdStr = String(exercise.exerciseId);
      const exerciseData = exerciseDatabase[exerciseIdStr] || exerciseDatabase[exercise.exerciseId];
      const exerciseName = exerciseData?.name || `Exercise ${exercise.exerciseId}`;

      return {
        name: exerciseName,
        sets: exercise.targetSets?.toString() || '3',
        reps: exercise.targetReps != null ? exercise.targetReps.toString() : '',
        restSeconds: exercise.restSeconds || 0,
        id: exercise.exerciseId,
      };
    });

    return {
      title: `${workoutName} — Week ${currentWeek} Day ${todaysDayIndex + 1}`,
      dayName: workoutName,
      type: workoutType,
      exercises,
      weekNumber: currentWeek,
      dayNumber: todaysDayIndex + 1,
      totalDays: activeSplit.totalDays,
      splitId: activeSplit.id,
      emoji: todaysWorkoutDay.emoji,
    };
  }, [activeSplit, currentWeek, currentDayIndex, exerciseDatabase]);

  // Advance to next workout day
  const advanceToNextDay = async (splitToUse = null) => {
    const split = splitToUse || activeSplit;
    if (!split || !split.totalDays) {
      console.error('[WorkoutContext] Cannot advance day - no active split');
      return;
    }

    const nextDayIndex = (currentDayIndex + 1) % split.totalDays;
    setCurrentDayIndex(nextDayIndex);

    let newWeek = currentWeek;
    if (nextDayIndex === 0) {
      newWeek = currentWeek + 1;
      setCurrentWeek(newWeek);
    }

    try {
      await AsyncStorage.setItem('currentDayIndex', nextDayIndex.toString());
      await AsyncStorage.setItem('currentWeek', newWeek.toString());
    } catch (error) {
      console.error('[WorkoutContext] Failed to save workout progress:', error);
    }
  };

  // Set specific day
  const setCurrentDay = async (dayIndex, weekNumber = currentWeek) => {
    setCurrentDayIndex(dayIndex);
    setCurrentWeek(weekNumber);

    try {
      await AsyncStorage.setItem('currentDayIndex', dayIndex.toString());
      await AsyncStorage.setItem('currentWeek', weekNumber.toString());
    } catch (error) {
      console.error('[WorkoutContext] Failed to save workout progress:', error);
    }
  };

  // Change active split
  const changeActiveSplit = async (newSplit) => {
    try {
      // Reset the previous split's started status
      if (activeSplit && activeSplit.id) {
        try {
          const { updateSplit } = await import('@/services/api/splits');
          await updateSplit(activeSplit.id, { started: false });
        } catch (error) {
          console.error('[WorkoutContext] Failed to reset previous split started status:', error);
          // Continue anyway - this is not critical
        }
      }

      setActiveSplit(newSplit);
      setCurrentDayIndex(0);
      setCurrentWeek(1);

      if (newSplit && user?.id) {
        await storage.saveSplit(user.id, newSplit);
        await AsyncStorage.setItem('currentDayIndex', '0');
        await AsyncStorage.setItem('currentWeek', '1');
      } else if (user?.id) {
        // Clear split data when null - use user-specific key
        const { getUserStorageKey, STORAGE_KEYS } = await import('@/services/storage/types');
        const splitKey = getUserStorageKey(STORAGE_KEYS.ACTIVE_SPLIT, user.id);
        await AsyncStorage.removeItem(splitKey);
        await AsyncStorage.removeItem('currentDayIndex');
        await AsyncStorage.removeItem('currentWeek');
      }
      await AsyncStorage.removeItem('lastCompletionDate');
    } catch (error) {
      console.error('[WorkoutContext] Failed to change split:', error);
    }
  };

  // Update active split
  const updateActiveSplit = async (updatedSplit) => {
    setActiveSplit(updatedSplit);

    try {
      if (user?.id) {
        await storage.saveSplit(user.id, updatedSplit);
      }
    } catch (error) {
      console.error('[WorkoutContext] Failed to update active split:', error);
    }
  };

  // Mark a free rest day (doesn't advance day index)
  const markFreeRestDay = async () => {
    const today = getLocalDateString();

    try {
      // Set completion date so UI state persists on reopen
      await AsyncStorage.setItem('lastCompletionDate', today);
      await AsyncStorage.setItem('lastCheckDate', today);
      await AsyncStorage.setItem('completedSessionId', 'free-rest-day');

      // Set freeRestDayDate so day advancement is skipped
      await AsyncStorage.setItem('freeRestDayDate', today);

      // Mark in calendar as rest day + free rest day
      if (user?.id) {
        const { markTodayCompleted } = await import('@/services/storage/calendarStorage');
        await markTodayCompleted(user.id, true, true);
      }

      // Mark usage in free rest day storage
      const { useFreeRestDay } = await import('@/services/storage/freeRestDayStorage');
      await useFreeRestDay();

      // Create dailyActivity entry on backend (replaces any existing entry for today)
      try {
        const { markRestDay } = await import('@/services/api/dailyActivity');
        await markRestDay(user.id, today, {
          activityType: 'free_rest',
          isPlanned: false,
        });
      } catch (error) {
        console.warn('Failed to sync free rest day to backend:', error.message);
      }

      // Update context state
      setLastCompletionDate(today);
      setTodaysWorkoutCompleted(true);
      setCompletedSessionId('free-rest-day');
    } catch (error) {
      console.error('[WorkoutContext] Failed to mark free rest day:', error);
    }
  };

  // Mark workout as completed
  // completedWorkoutData is optional - the actual exercises/sets performed (different from template)
  const markWorkoutCompleted = async (workoutSessionId, isRestDay = false, workoutDetails = null, completedWorkoutData = null) => {
    const today = getLocalDateString();

    try {
      if (workoutSessionId) {
        // Parallelize independent AsyncStorage writes
        const writes = [
          AsyncStorage.setItem('lastCompletionDate', today),
          AsyncStorage.setItem('lastCheckDate', today),
          AsyncStorage.setItem('completedSessionId', workoutSessionId.toString()),
        ];

        // Store the actual completed workout data (exercises performed, not template)
        if (completedWorkoutData) {
          setCompletedSplitWorkout(completedWorkoutData);
          writes.push(
            AsyncStorage.setItem('completedSplitWorkout', JSON.stringify(completedWorkoutData)),
            AsyncStorage.setItem('completedSplitWorkoutDate', today),
          );
        }

        await Promise.all(writes);

        // Mark today as completed in calendar with workout details
        if (user?.id) {
          const { markTodayCompleted } = await import('@/services/storage/calendarStorage');

          // If no workout details provided, try to get them from todaysWorkout
          let details = workoutDetails;
          if (!details && !isRestDay) {
            const currentWorkout = getTodaysWorkout();
            if (currentWorkout) {
              // Extract muscle groups from exercises
              const muscleGroups = [];
              currentWorkout.exercises?.forEach(ex => {
                const muscle = ex.primaryMuscle || ex.muscleGroup;
                if (muscle && !muscleGroups.includes(muscle)) {
                  muscleGroups.push(muscle);
                }
              });

              // Calculate total sets
              let totalSets = 0;
              currentWorkout.exercises?.forEach(ex => {
                totalSets += ex.sets || ex.targetSets || 0;
              });

              details = {
                workoutName: currentWorkout.dayName,
                muscleGroups,
                totalExercises: currentWorkout.exercises?.length || 0,
                totalSets: totalSets || null,
                splitEmoji: currentWorkout.emoji,
              };
            }
          }

          await markTodayCompleted(user.id, isRestDay, false, details);
        }
      } else {
        await AsyncStorage.multiRemove(['completedSessionId', 'lastCompletionDate', 'lastCheckDate', 'completedSplitWorkout', 'completedSplitWorkoutDate']);

        // Clear the completed split workout data
        setCompletedSplitWorkout(null);

        // Unmark today in calendar (uncomplete)
        if (user?.id) {
          const { unmarkTodayCompleted } = await import('@/services/storage/calendarStorage');
          await unmarkTodayCompleted(user.id);
        }
      }

      // Then update state (triggers ProgressTab refresh after calendar is updated)
      setLastWorkoutCompleted({
        sessionId: workoutSessionId,
        timestamp: new Date().toISOString(),
      });

      setLastCompletionDate(workoutSessionId ? today : null);
      setTodaysWorkoutCompleted(workoutSessionId !== null);
      setCompletedSessionId(workoutSessionId);
    } catch (error) {
      console.error('[WorkoutContext] Failed to save completion date:', error);
    }
  };

  // Mark individual workout (freestyle/saved) as completed or clear it
  const markIndividualWorkoutCompleted = async (workoutData) => {
    const today = getLocalDateString();
    try {
      if (workoutData) {
        setIndividualWorkoutCompleted(true);
        setCompletedIndividualWorkout(workoutData);
        await AsyncStorage.setItem('individualWorkoutCompleted', 'true');
        await AsyncStorage.setItem('completedIndividualWorkout', JSON.stringify(workoutData));
        await AsyncStorage.setItem('individualWorkoutDate', today);

        // Mark today as completed in calendar with workout details
        if (user?.id) {
          const { markTodayCompleted } = await import('@/services/storage/calendarStorage');

          // Extract workout details from workoutData
          const muscleGroups = [];
          workoutData.exercises?.forEach(ex => {
            const muscle = ex.primaryMuscle || ex.muscleGroup;
            if (muscle && !muscleGroups.includes(muscle)) {
              muscleGroups.push(muscle);
            }
          });

          // Use pre-calculated totalSets if available, otherwise calculate
          let totalSets = workoutData.totalSets || 0;
          if (!totalSets && workoutData.exercises) {
            workoutData.exercises.forEach(ex => {
              totalSets += ex.totalSets || 0;
            });
          }

          const details = {
            workoutName: workoutData.workoutName || workoutData.name || 'Workout',
            muscleGroups,
            totalExercises: workoutData.exercises?.length || 0,
            totalSets: totalSets || null,
            durationMinutes: workoutData.durationMinutes || null,
          };

          await markTodayCompleted(user.id, false, false, details);
        }
      } else {
        // Get the stored workout data before clearing to retrieve workoutSessionId
        const storedWorkoutJson = await AsyncStorage.getItem('completedIndividualWorkout');
        const storedWorkout = storedWorkoutJson ? JSON.parse(storedWorkoutJson) : null;

        // Delete workout session from backend and revert PRs
        if (user?.id && storedWorkout?.workoutSessionId) {
          const localId = storedWorkout.workoutSessionId;
          const databaseId = await storage.getWorkoutDatabaseId(user.id, localId);

          if (databaseId) {
            try {
              const { deleteWorkoutSession } = await import('@/services/api/workoutSessions');
              const result = await deleteWorkoutSession(databaseId);

              // Update local PR store with recalculated PRs
              if (result?.updatedPRs) {
                const { getLocalPRStore, saveLocalPRStore } = await import('@/services/storage/prTracking');
                const prStore = await getLocalPRStore(user.id);
                for (const [exercise, value] of Object.entries(result.updatedPRs)) {
                  if (value === null) {
                    delete prStore[exercise];
                  } else {
                    prStore[exercise] = { bestE1RM: value };
                  }
                }
                await saveLocalPRStore(user.id, prStore);
              }
            } catch (error) {
              if (error.response?.status !== 404) {
                console.error('[WorkoutContext] Error deleting workout from backend:', error);
              }
            }
            await storage.deleteWorkoutDatabaseId(user.id, localId);
          } else {
            // No backend ID — re-seed local PR store from backend to fix local-only inflation
            try {
              const { fetchAndSeedPRs, saveLocalPRStore } = await import('@/services/storage/prTracking');
              // Clear local store so fetchAndSeedPRs will re-seed from backend
              await saveLocalPRStore(user.id, {});
              await fetchAndSeedPRs(user.id);
            } catch (error) {
              console.error('[WorkoutContext] Error re-seeding PRs from backend:', error);
            }
          }
        }

        // Clear state
        setIndividualWorkoutCompleted(false);
        setCompletedIndividualWorkout(null);
        await AsyncStorage.multiRemove(['individualWorkoutCompleted', 'completedIndividualWorkout', 'individualWorkoutDate']);

        // Unmark today in calendar (uncomplete)
        if (user?.id) {
          const { unmarkTodayCompleted } = await import('@/services/storage/calendarStorage');
          await unmarkTodayCompleted(user.id);
        }
      }

      // Notify ProgressTab to refresh calendar display
      setLastWorkoutCompleted({
        sessionId: workoutData ? 'individual' : null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[WorkoutContext] Failed to mark individual workout completed:', error);
    }
  };

  // Check today's workout status
  const checkTodaysWorkoutStatus = async (userId) => {
    if (!userId) return;

    try {
      const savedCompletionDate = await AsyncStorage.getItem('lastCompletionDate');
      const savedSessionId = await AsyncStorage.getItem('completedSessionId');
      const savedLastCheckDate = await AsyncStorage.getItem('lastCheckDate');
      const today = getLocalDateString();

      if (savedCompletionDate === today && savedLastCheckDate === today && savedSessionId) {
        setTodaysWorkoutCompleted(true);
        setCompletedSessionId(savedSessionId === 'free-rest-day' ? 'free-rest-day' : parseInt(savedSessionId));
        return true;
      } else {
        setTodaysWorkoutCompleted(false);
        setCompletedSessionId(null);
        return false;
      }
    } catch (error) {
      console.error('[WorkoutContext] Failed to check workout status:', error);
      return false;
    }
  };

  // Memoize today's workout to prevent unnecessary recalculations
  const todaysWorkout = useMemo(() => {
    return getTodaysWorkout();
  }, [getTodaysWorkout]);

  // Refresh exercise database (bundled + custom from backend)
  const refreshExerciseDatabase = useCallback(async () => {
    try {
      const exercises = await storage.getExercises();
      const exerciseMap = {};
      exercises.forEach(ex => {
        exerciseMap[ex.id] = ex;
      });

      // Fetch custom exercises from backend (no local cache)
      if (user?.id) {
        try {
          const customExercises = await getCustomExercises(user.id);
          customExercises.forEach(ex => {
            exerciseMap[String(ex.id)] = { ...ex, isCustom: true };
          });
        } catch (err) {
          console.warn('[WorkoutContext] Failed to fetch custom exercises:', err.message);
        }
      }

      setExerciseDatabase(exerciseMap);
    } catch (error) {
      console.error('[WorkoutContext] Failed to refresh exercise database:', error);
    }
  }, [user?.id]);

  // Refresh today's workout from local storage
  const refreshTodaysWorkout = useCallback(async () => {
    try {
      if (!user?.id) return;

      // Read all async data first
      const localSplit = await storage.getSplit(user.id);
      let newWeek, newDayIndex;
      if (localSplit) {
        const savedWeek = await AsyncStorage.getItem('currentWeek');
        const savedDayIndex = await AsyncStorage.getItem('currentDayIndex');
        newWeek = savedWeek ? parseInt(savedWeek, 10) : undefined;
        newDayIndex = savedDayIndex ? parseInt(savedDayIndex, 10) : undefined;
      }

      // Set all state synchronously — React batches into one render
      setActiveSplit(localSplit);
      if (newWeek !== undefined) setCurrentWeek(newWeek);
      if (newDayIndex !== undefined) setCurrentDayIndex(newDayIndex);

      if (localSplit) {
        await checkTodaysWorkoutStatus();
      }
    } catch (error) {
      console.error('[WorkoutContext] Error refreshing from local storage:', error);
    }
  }, [checkTodaysWorkoutStatus, user?.id]);

  const value = {
    activeSplit,
    setActiveSplit,
    currentWeek,
    currentDayIndex,
    getTodaysWorkout,
    advanceToNextDay,
    setCurrentDay,
    changeActiveSplit,
    updateActiveSplit,
    todaysWorkout,
    lastWorkoutCompleted,
    markWorkoutCompleted,
    markFreeRestDay,
    todaysWorkoutCompleted,
    completedSessionId,
    checkTodaysWorkoutStatus,
    refreshTodaysWorkout,
    refreshExerciseDatabase,
    exerciseDatabase,
    isInitialized,
    // Individual workout completion
    individualWorkoutCompleted,
    completedIndividualWorkout,
    markIndividualWorkoutCompleted,
    // Split workout completion (actual session data)
    completedSplitWorkout,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};

export default WorkoutProvider;
