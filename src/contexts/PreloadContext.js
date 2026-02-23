import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { getSplitsByUserId } from '@/services/api/splits';
import { getBodyWeightEntries } from '@/services/api/bodyWeight';
import { getWorkoutSessionsByUserId } from '@/services/api/workoutSessions';
import { getCalendarDataForDisplay } from '@/services/storage/calendarStorage';

const PreloadContext = createContext();

export const usePreload = () => {
  const context = useContext(PreloadContext);
  if (!context) {
    throw new Error('usePreload must be used within a PreloadProvider');
  }
  return context;
};

export const PreloadProvider = ({ children }) => {
  const { user, isOffline } = useAuth();

  // Preloaded data state
  const [calendarData, setCalendarData] = useState([]);
  const [splitsList, setSplitsList] = useState([]);
  const [bodyWeightData, setBodyWeightData] = useState([]);
  const [workoutSessions, setWorkoutSessions] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [splitsLoading, setSplitsLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  // Track if initial load has completed
  const hasPreloaded = useRef(false);
  // Track if component is mounted to prevent setState after unmount
  const isMountedRef = useRef(true);

  // Preload all data in parallel
  const preloadAll = useCallback(async (userId) => {
    if (!userId || isOffline) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch all data in parallel
      const [calendar, splits, bodyWeight, sessions] = await Promise.all([
        getCalendarDataForDisplay(userId).catch(err => {
          return [];
        }),
        getSplitsByUserId(userId).catch(err => {
          return [];
        }),
        getBodyWeightEntries(userId).catch(err => {
          return [];
        }),
        getWorkoutSessionsByUserId(userId).catch(err => {
          return [];
        }),
      ]);

      if (isMountedRef.current) {
        setCalendarData(calendar);
        setSplitsList(splits);
        setBodyWeightData(bodyWeight || []);
        setWorkoutSessions(sessions || []);
        hasPreloaded.current = true;
      }
    } catch (error) {
      console.error('[PreloadContext] Preload failed:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [isOffline]);

  // Refresh calendar data
  const refreshCalendar = useCallback(async () => {
    if (!user?.id || isOffline) return;

    setCalendarLoading(true);
    try {
      const calendar = await getCalendarDataForDisplay(user.id);
      if (isMountedRef.current) {
        setCalendarData(calendar);
      }
    } catch (error) {
      // Silently ignore calendar refresh errors
    } finally {
      if (isMountedRef.current) {
        setCalendarLoading(false);
      }
    }
  }, [user?.id, isOffline]);

  // Refresh splits list
  const refreshSplits = useCallback(async () => {
    if (!user?.id || isOffline) return;

    setSplitsLoading(true);
    try {
      const splits = await getSplitsByUserId(user.id);
      if (isMountedRef.current) {
        setSplitsList(splits);
      }
    } catch (error) {
      // Silently ignore splits refresh errors
    } finally {
      if (isMountedRef.current) {
        setSplitsLoading(false);
      }
    }
  }, [user?.id, isOffline]);

  // Refresh progress data (body weight + workout sessions)
  const refreshProgress = useCallback(async () => {
    if (!user?.id || isOffline) return;

    setProgressLoading(true);
    try {
      const [bodyWeight, sessions] = await Promise.all([
        getBodyWeightEntries(user.id).catch(() => []),
        getWorkoutSessionsByUserId(user.id).catch(() => []),
      ]);
      if (isMountedRef.current) {
        setBodyWeightData(bodyWeight || []);
        setWorkoutSessions(sessions || []);
      }
    } catch (error) {
      // Silently ignore progress refresh errors
    } finally {
      if (isMountedRef.current) {
        setProgressLoading(false);
      }
    }
  }, [user?.id, isOffline]);

  // Trigger preload when user becomes available
  useEffect(() => {
    isMountedRef.current = true;

    if (user?.id && !hasPreloaded.current) {
      preloadAll(user.id);
    } else if (!user?.id) {
      // Clear data when user logs out
      setCalendarData([]);
      setSplitsList([]);
      setBodyWeightData([]);
      setWorkoutSessions([]);
      hasPreloaded.current = false;
      setLoading(false);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [user?.id, preloadAll]);

  const value = {
    // Data
    calendarData,
    splitsList,
    bodyWeightData,
    workoutSessions,

    // Loading states
    loading,
    calendarLoading,
    splitsLoading,
    progressLoading,

    // Refresh functions
    refreshCalendar,
    refreshSplits,
    refreshProgress,
    preloadAll,

    // Setters for direct updates (e.g., after mutations)
    setCalendarData,
    setSplitsList,
    setBodyWeightData,
    setWorkoutSessions,
  };

  return (
    <PreloadContext.Provider value={value}>
      {children}
    </PreloadContext.Provider>
  );
};

export default PreloadProvider;
