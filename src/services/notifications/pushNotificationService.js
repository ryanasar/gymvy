import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { BACKEND_API_URL } from '@/constants/config';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get the Expo push token
 * @returns {Promise<string|null>} The Expo push token or null if registration fails
 */
export const registerForPushNotificationsAsync = async () => {
  let token = null;

  // Must be a physical device
  if (!Device.isDevice) {
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    // Get the project ID from Constants
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      return null;
    }

    // Get the Expo push token
    const pushToken = await Notifications.getExpoPushTokenAsync({
      projectId
    });

    token = pushToken.data;
  } catch (error) {
    return null;
  }

  // Android needs a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
};

/**
 * Register the push token with the backend
 * @param {string} supabaseId - The user's Supabase ID
 * @param {string} token - The Expo push token
 */
export const registerTokenWithBackend = async (supabaseId, token) => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/push-tokens/register/${supabaseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        platform: Platform.OS
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to register token with backend');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove the push token from the backend (e.g., on logout)
 * @param {string} token - The Expo push token to remove
 */
export const removeTokenFromBackend = async (token) => {
  if (!token) return;

  try {
    const response = await fetch(`${BACKEND_API_URL}/push-tokens/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove token from backend');
    }
  } catch (error) {
    // Silently fail
  }
};

/**
 * Schedule a local notification (for testing)
 */
export const scheduleLocalNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: { seconds: 1 },
  });
};

// Identifier for streak lost notifications so we can cancel them
const STREAK_LOST_IDENTIFIER = 'streak-lost-notification';

/**
 * Schedule a streak lost notification for 8am tomorrow
 * Called when we detect the user has a 5+ day streak and hasn't worked out today
 * @param {number} streak - The streak count that will be lost
 * @param {string} missedDate - YYYY-MM-DD of the day that was missed
 */
export const scheduleStreakLostNotification = async (streak, missedDate) => {
  try {
    // Cancel any existing streak lost notification first
    await cancelStreakLostNotification();

    // Schedule for 8am tomorrow
    const trigger = new Date();
    trigger.setDate(trigger.getDate() + 1);
    trigger.setHours(8, 0, 0, 0);

    // Calculate expiry (end of tomorrow)
    const expiresAt = new Date(trigger);
    expiresAt.setHours(23, 59, 59, 999);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Streak Lost 😔',
        body: `Your ${streak}-day streak ended. Restore it before midnight!`,
        data: {
          type: 'streak_lost',
          lostStreak: streak,
          missedDate,
          expiresAt: expiresAt.toISOString(),
        },
      },
      trigger: { date: trigger },
      identifier: STREAK_LOST_IDENTIFIER,
    });

    console.log('[PushNotification] Scheduled streak lost notification for:', trigger.toISOString());
  } catch (error) {
    console.error('[PushNotification] Error scheduling streak lost notification:', error);
  }
};

/**
 * Cancel any pending streak lost notification
 * Called when the user completes a workout (streak preserved)
 */
export const cancelStreakLostNotification = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync(STREAK_LOST_IDENTIFIER);
  } catch (error) {
    // Silently fail - notification may not exist
  }
};

export default {
  registerForPushNotificationsAsync,
  registerTokenWithBackend,
  removeTokenFromBackend,
  scheduleLocalNotification,
  scheduleStreakLostNotification,
  cancelStreakLostNotification,
};
