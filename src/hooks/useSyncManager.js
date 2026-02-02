/**
 * useSyncManager Hook
 * Manages background sync of pending workouts
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { backgroundSync, getSyncStatus } from '@/services/storage';
import { useAuth } from '@/lib/auth';
import { subscribeToNetworkChanges } from '@/services/network/networkService';

/**
 * Hook to manage background sync
 * @param {object} options - Configuration options
 * @param {number} options.syncInterval - Sync interval in milliseconds (default: 5 minutes)
 * @param {boolean} options.syncOnMount - Sync on component mount (default: true)
 * @param {boolean} options.syncOnForeground - Sync when app comes to foreground (default: true)
 */
export function useSyncManager(options = {}) {
  const {
    syncInterval = 5 * 60 * 1000, // 5 minutes
    syncOnMount = true,
    syncOnForeground = true,
  } = options;

  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const syncIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const syncPromiseRef = useRef(null); // Track ongoing sync promise

  /**
   * Performs a sync operation
   * Returns a promise that resolves when sync completes
   * If sync is already in progress, returns the existing promise (callers can await it)
   */
  const performSync = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    // If already syncing, return the existing promise so callers can await it
    if (syncPromiseRef.current) {
      return syncPromiseRef.current;
    }

    const doSync = async () => {
      try {
        setIsSyncing(true);
        setSyncError(null);

        const result = await backgroundSync(user.id);

        setLastSyncTime(Date.now());

        if (result && result.failed > 0) {
          setSyncError(`Failed to sync ${result.failed} workout(s)`);
        }

        // Update pending count (pass userId!)
        const status = await getSyncStatus(user.id);
        setPendingCount(status.pendingCount);
      } catch (error) {
        console.error('[useSyncManager] Sync failed:', error);
        setSyncError('Sync failed. Will retry later.');
      } finally {
        setIsSyncing(false);
        syncPromiseRef.current = null;
      }
    };

    syncPromiseRef.current = doSync();
    return syncPromiseRef.current;
  }, [user?.id]);

  /**
   * Updates the pending count
   */
  const updatePendingCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const status = await getSyncStatus(user.id);
      setPendingCount(status.pendingCount);
    } catch (error) {
      console.error('[useSyncManager] Failed to update pending count:', error);
    }
  }, [user?.id]);

  // Sync on mount
  useEffect(() => {
    if (syncOnMount && user?.id) {
      performSync();
    }
  }, [syncOnMount, user?.id]);

  // Set up periodic sync
  useEffect(() => {
    if (!user?.id || syncInterval <= 0) {
      return;
    }

    syncIntervalRef.current = setInterval(() => {
      performSync();
    }, syncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [user?.id, syncInterval, performSync]);

  // Sync when app comes to foreground
  useEffect(() => {
    if (!syncOnForeground || !user?.id) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        performSync();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [syncOnForeground, user?.id, performSync]);

  // Update pending count whenever user changes
  useEffect(() => {
    if (user?.id) {
      updatePendingCount();
    }
  }, [user?.id, updatePendingCount]);

  // Sync when network comes back online
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let wasOffline = false;

    const unsubscribe = subscribeToNetworkChanges((isOnline) => {
      if (isOnline && wasOffline) {
        // Network restored - trigger sync
        console.log('[useSyncManager] Network restored, triggering sync');
        performSync();
      }
      wasOffline = !isOnline;
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id, performSync]);

  return {
    isSyncing,
    pendingCount,
    lastSyncTime,
    syncError,
    manualSync: performSync,
    updatePendingCount,
  };
}
