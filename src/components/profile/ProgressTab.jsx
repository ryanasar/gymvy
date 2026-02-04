import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ScrollView, StyleSheet, RefreshControl, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { getWorkoutSessionsByUserId } from '@/services/api/workoutSessions';
import { getPostsByUserId } from '@/services/api/posts';
import { getCalendarData } from '@/services/api/dailyActivity';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useWorkout } from '@/contexts/WorkoutContext';
import { usePreload } from '@/contexts/PreloadContext';
import { useAuth } from '@/lib/auth';
import { getCalendarDataForDisplay } from '@/services/storage/calendarStorage';
import WorkoutCalendar from '@/components/progress/WorkoutCalendar';

const ProgressTab = ({ userId, onRefresh, embedded = false, prefetchedCalendarData = null }) => {
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const [workoutsByDay, setWorkoutsByDay] = useState([]);
  const { lastWorkoutCompleted, todaysWorkout } = useWorkout();
  const { calendarData: preloadedCalendar, calendarLoading, refreshCalendar } = usePreload();
  const { user: currentUser } = useAuth();
  const isInitialMount = useRef(true);
  const isFetching = useRef(false);
  const hasBackfilled = useRef(false);
  const isMountedRef = useRef(true);

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = currentUser?.id === userId;

  // Use prefetched calendar data for other users' profiles (from parallel fetch)
  useEffect(() => {
    if (!isOwnProfile && prefetchedCalendarData && prefetchedCalendarData.activities) {
      // Transform DailyActivity data to the format expected by WorkoutCalendar
      const calendarDataMap = prefetchedCalendarData.activities.map(activity => ({
        date: activity.date.split('T')[0],
        volume: activity.activityType === 'workout' ? 1 : 0,
        isRestDay: activity.activityType !== 'workout',
        isFreeRestDay: activity.activityType === 'free_rest',
        workoutName: activity.workoutName || null,
        muscleGroups: activity.muscleGroups || [],
        totalExercises: activity.totalExercises || null,
        totalSets: activity.totalSets || null,
        durationMinutes: activity.durationMinutes || null,
        splitName: activity.split?.name || null,
        splitEmoji: activity.split?.emoji || null,
      }));
      setWorkoutsByDay(calendarDataMap);
      hasBackfilled.current = true;
      setRefreshing(false);
    }
  }, [isOwnProfile, prefetchedCalendarData]);

  // Use preloaded calendar data for own profile
  useEffect(() => {
    if (isOwnProfile && preloadedCalendar && preloadedCalendar.length > 0 && !calendarLoading) {
      setWorkoutsByDay(preloadedCalendar);
      hasBackfilled.current = true;
      setRefreshing(false);
    }
  }, [isOwnProfile, preloadedCalendar, calendarLoading]);

  // Initial load for OTHER users' profiles - fetch their data (only if not prefetched)
  useEffect(() => {
    isMountedRef.current = true;

    // Skip fetching if we have prefetched data or already backfilled
    if (userId && !isOwnProfile && !hasBackfilled.current && !prefetchedCalendarData) {
      setRefreshing(true);
      fetchProgressData(true);
    }
    // Cleanup on unmount - prevent setState after unmount
    return () => {
      isMountedRef.current = false;
      isFetching.current = false;
    };
  }, [userId, isOwnProfile, prefetchedCalendarData]);

  // Refresh data when workout is completed or uncompleted (skip initial mount)
  // Only refresh for OWN profile, not when viewing other users
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only refresh when viewing own profile and workout status changes
    if (userId && isOwnProfile) {
      // Refresh calendar from preload context
      refreshCalendar();
    }
  }, [lastWorkoutCompleted, isOwnProfile, refreshCalendar]);

  const fetchProgressData = async (includeBackend = false) => {
    // Prevent concurrent fetches
    if (isFetching.current) {
      return;
    }

    try {
      isFetching.current = true;

      // Check if userId is valid
      if (!userId) {
        setWorkoutsByDay([]);
        return;
      }

      // For OTHER users' profiles: Use DailyActivity API as the single source of truth
      if (!isOwnProfile) {
        try {
          // Try the new DailyActivity API first
          const calendarResponse = await getCalendarData(userId);

          if (calendarResponse && calendarResponse.activities) {
            // Transform DailyActivity data to the format expected by WorkoutCalendar
            // Include full workout details for the popup
            const calendarDataMap = calendarResponse.activities.map(activity => ({
              date: activity.date.split('T')[0],
              volume: activity.activityType === 'workout' ? 1 : 0,
              isRestDay: activity.activityType !== 'workout',
              isFreeRestDay: activity.activityType === 'free_rest',
              // Workout details for popup
              workoutName: activity.workoutName || null,
              muscleGroups: activity.muscleGroups || [],
              totalExercises: activity.totalExercises || null,
              totalSets: activity.totalSets || null,
              durationMinutes: activity.durationMinutes || null,
              splitName: activity.split?.name || null,
              splitEmoji: activity.split?.emoji || null,
            }));

            setWorkoutsByDay(calendarDataMap);
            return;
          }
        } catch (dailyActivityError) {
          // If DailyActivity API fails, fall back to old method
          console.log('[ProgressTab] DailyActivity API not available, falling back to sessions/posts');
        }

        // Fallback: fetch from workout sessions and posts (legacy method)
        try {
          const [sessions, posts] = await Promise.all([
            getWorkoutSessionsByUserId(userId),
            getPostsByUserId(userId)
          ]);

          const calendarDataMap = {};

          // Helper to format date in local timezone
          const formatLocalDate = (dateInput) => {
            const d = new Date(dateInput);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          // Process workout sessions
          if (sessions && Array.isArray(sessions)) {
            sessions
              .filter(session => session.completedAt)
              .forEach(session => {
                const date = formatLocalDate(session.completedAt);
                const isRestDay = session.type === 'rest_day' ||
                                (session.exercises?.length === 0 && session.dayName === 'Rest Day');

                // Calculate duration if we have start and end times
                let durationMinutes = null;
                if (session.startedAt && session.completedAt) {
                  const start = new Date(session.startedAt);
                  const end = new Date(session.completedAt);
                  durationMinutes = Math.round((end - start) / (1000 * 60));
                }

                // Calculate total sets
                let totalSets = 0;
                if (session.exercises && Array.isArray(session.exercises)) {
                  session.exercises.forEach(ex => {
                    if (ex.sets && Array.isArray(ex.sets)) {
                      totalSets += ex.sets.length;
                    }
                  });
                }

                // Get unique muscle groups
                const muscleGroups = [];
                if (session.exercises && Array.isArray(session.exercises)) {
                  session.exercises.forEach(ex => {
                    if (ex.primaryMuscle && !muscleGroups.includes(ex.primaryMuscle)) {
                      muscleGroups.push(ex.primaryMuscle);
                    }
                  });
                }

                calendarDataMap[date] = {
                  date,
                  volume: isRestDay ? 0 : 1,
                  isRestDay: isRestDay,
                  isFreeRestDay: false,
                  // Workout details for popup
                  workoutName: session.dayName || session.workoutName || null,
                  muscleGroups: muscleGroups,
                  totalExercises: session.exercises?.length || null,
                  totalSets: totalSets || null,
                  durationMinutes: durationMinutes,
                  splitName: session.splitName || null,
                  splitEmoji: session.splitEmoji || null,
                };
              });
          }

          // Process posts to find rest day posts (posts without workoutSessionId that have "Recovery:" in description)
          if (posts && Array.isArray(posts)) {
            posts.forEach(post => {
              // Rest day posts don't have workoutSessionId and have "Recovery:" in description
              const isRestDayPost = !post.workoutSessionId &&
                                   post.description &&
                                   post.description.includes('Recovery:');

              if (isRestDayPost && post.createdAt) {
                const date = formatLocalDate(post.createdAt);

                // Only add if we don't already have a workout for this date
                if (!calendarDataMap[date]) {
                  calendarDataMap[date] = {
                    date,
                    volume: 0,
                    isRestDay: true,
                    isFreeRestDay: false
                  };
                }
              }
            });
          }

          if (isMountedRef.current) {
            setWorkoutsByDay(Object.values(calendarDataMap));
          }
        } catch (backendError) {
          console.error('[ProgressTab] Error fetching other user calendar:', backendError);
          if (isMountedRef.current) {
            setWorkoutsByDay([]);
          }
        }
        return;
      }

      // For OWN profile: Use preloaded calendar data from PreloadContext
      // This is handled by the useEffect above, but as a fallback:
      if (preloadedCalendar && preloadedCalendar.length > 0) {
        setWorkoutsByDay(preloadedCalendar);
      } else {
        // Fallback to direct fetch if preloaded data not available
        const calendarData = await getCalendarDataForDisplay(userId);
        setWorkoutsByDay(calendarData);
      }
      hasBackfilled.current = true;

    } catch (error) {
      // Set empty data on error
      if (isMountedRef.current) {
        setWorkoutsByDay([]);
      }
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
      isFetching.current = false;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (isOwnProfile) {
      // Use preload context for own profile
      await refreshCalendar();
      setRefreshing(false);
    } else {
      // Fetch other user's data directly
      hasBackfilled.current = false;
      await fetchProgressData(true);
    }
    if (onRefresh) await onRefresh();
  };

  // When embedded in parent ScrollView, render without own ScrollView
  if (embedded) {
    return (
      <View style={[styles.embeddedContainer, { backgroundColor: colors.background }]}>
        <WorkoutCalendar
          workoutsByDay={workoutsByDay}
          todaysWorkout={isOwnProfile ? todaysWorkout : null}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      {/* Workout Calendar Section */}
      {/* Only show todaysWorkout for own profile, not for other users */}
      <WorkoutCalendar
        workoutsByDay={workoutsByDay}
        todaysWorkout={isOwnProfile ? todaysWorkout : null}
      />
    </ScrollView>
  );
};

export default ProgressTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  embeddedContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 20,
  },
  section: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
});
