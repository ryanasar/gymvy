import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { getNotificationsWithActors, markAllNotificationsAsReadApi, markAllNotificationsAsRead } from '@/services/api/notifications';
import { useAuth } from '@/lib/auth';

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  refreshNotifications: () => Promise.resolve(),
  markAllAsRead: () => Promise.resolve(),
});

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Compute unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Fetch notifications with actor data pre-joined
  const refreshNotifications = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await getNotificationsWithActors();
      setNotifications(data);
    } catch (error) {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Mark all notifications as read (called when user views notifications)
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || unreadCount === 0) return;

    try {
      // Try the new API endpoint first, fall back to direct Supabase
      const success = await markAllNotificationsAsReadApi();
      if (!success) {
        await markAllNotificationsAsRead(user.id);
      }
      // Update local state to mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      // Silently fail
    }
  }, [user?.id, unreadCount]);

  // Initial fetch when user logs in
  useEffect(() => {
    if (user?.id) {
      refreshNotifications();
    } else {
      setNotifications([]);
    }
  }, [user?.id, refreshNotifications]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    let channel = null;
    let isSubscribed = false;
    let retryCount = 0;
    let retryTimeout = null;
    let unmounted = false;

    const setupSubscription = () => {
      if (unmounted) return;

      // Remove existing channel if any
      if (channel) {
        supabase.removeChannel(channel);
      }

      const channelName = `notifications-${user.id}-${Date.now()}`;

      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'Notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev]);
          }
        )
        .subscribe((status, err) => {
          if (unmounted) return;

          if (status === 'SUBSCRIBED') {
            isSubscribed = true;
            retryCount = 0;
          }

          if (status === 'CHANNEL_ERROR') {
            isSubscribed = false;
            scheduleReconnect();
          }

          if (status === 'CLOSED' && isSubscribed) {
            isSubscribed = false;
            scheduleReconnect();
          }
        });
    };

    const scheduleReconnect = () => {
      if (unmounted) return;
      if (retryTimeout) clearTimeout(retryTimeout);

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      retryCount++;

      retryTimeout = setTimeout(setupSubscription, delay);
    };

    setupSubscription();

    // Reconnect when app comes back to foreground
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && !isSubscribed && !unmounted) {
        retryCount = 0;
        setupSubscription();
        // Also refresh notifications in case we missed any while backgrounded
        refreshNotifications();
      }
    });

    return () => {
      unmounted = true;
      isSubscribed = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      appStateSubscription.remove();
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
