import React, { createContext, useContext, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { setPostHogInstance, trackAppOpened, trackAppBackgrounded } from '@/lib/analytics';

// PostHog configuration
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '';
const POSTHOG_HOST = 'https://us.i.posthog.com'; // Use 'https://eu.i.posthog.com' for EU

interface AnalyticsContextType {
  isInitialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  isInitialized: false,
});

// Component that initializes PostHog instance and tracks app lifecycle
const AnalyticsInitializer = ({ children }: { children: React.ReactNode }) => {
  const posthog = usePostHog();
  const appState = useRef(AppState.currentState);
  const hasTrackedOpen = useRef(false);

  // Set the PostHog instance for our analytics helpers
  useEffect(() => {
    if (posthog) {
      setPostHogInstance(posthog);

      // Track initial app open (only once per session)
      if (!hasTrackedOpen.current) {
        trackAppOpened();
        hasTrackedOpen.current = true;
      }
    }
  }, [posthog]);

  // Track app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        trackAppOpened();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App went to background
        trackAppBackgrounded();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AnalyticsContext.Provider value={{ isInitialized: !!posthog }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Main provider component - wrap this around your entire app
export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  // Don't initialize if no API key
  if (!POSTHOG_API_KEY) {
    if (__DEV__) {
      console.warn('[Analytics] PostHog API key not found. Add EXPO_PUBLIC_POSTHOG_API_KEY to your .env file.');
    }
    return (
      <AnalyticsContext.Provider value={{ isInitialized: false }}>
        {children}
      </AnalyticsContext.Provider>
    );
  }

  return (
    <PostHogProvider
      apiKey={POSTHOG_API_KEY}
      options={{
        host: POSTHOG_HOST,
        // Capture app lifecycle events automatically
        captureApplicationLifecycleEvents: true,
        // Capture screen views automatically
        captureDeepLinks: true,
        // Enable debug logging in development
        debug: __DEV__,
      }}
    >
      <AnalyticsInitializer>
        {children}
      </AnalyticsInitializer>
    </PostHogProvider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsProvider;
