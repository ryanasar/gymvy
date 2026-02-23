import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  // Not logged in - go to auth
  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Logged in but hasn't completed onboarding - go to onboarding
  if (user && !user.hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  // Logged in and completed onboarding - go to home screen
  // The tabs layout will redirect to workout tab if there's an active workout
  return <Redirect href="/(tabs)" />;
}
