import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useThemeColors } from '@/hooks/useThemeColors';
import { completeUserOnboarding } from '@/services/api/users';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const CARDS = [
  {
    icon: 'calendar-outline',
    iconBgKey: 'primary',
    title: 'Workout Splits',
    description: 'Plan a structured multi-day routine. Best for consistent training schedules.',
    badge: 'Recommended',
    badgeColorKey: 'primary',
    type: 'splits',
  },
  {
    icon: 'barbell-outline',
    iconBgKey: 'accent',
    title: 'Saved Workouts',
    description: 'Build and save reusable workout templates with your favorite exercises.',
    badge: null,
    badgeColorKey: null,
    type: 'saved',
  },
  {
    icon: 'flash-outline',
    iconBgKey: 'warning',
    title: 'Freestyle',
    description: 'Jump right in and add exercises on the fly. No planning needed.',
    badge: 'Quick Start',
    badgeColorKey: 'warning',
    type: 'freestyle',
  },
];

export default function OnboardingComplete() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);

  // Animation shared values
  const checkScale = useSharedValue(0);
  const checkRotate = useSharedValue(-180);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(1);
  const titleOpacity = useSharedValue(0);
  const titleTranslate = useSharedValue(30);
  const card1Opacity = useSharedValue(0);
  const card1Translate = useSharedValue(30);
  const card2Opacity = useSharedValue(0);
  const card2Translate = useSharedValue(30);
  const card3Opacity = useSharedValue(0);
  const card3Translate = useSharedValue(30);
  const footerScale = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    // 1. Checkmark + ring (200ms)
    checkScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 80 }));
    checkRotate.value = withDelay(200, withSpring(0, { damping: 12, stiffness: 80 }));
    ringScale.value = withDelay(300, withTiming(2, { duration: 600, easing: Easing.out(Easing.cubic) }));
    ringOpacity.value = withDelay(300, withTiming(0, { duration: 600 }));

    // 2. Title + subtitle (500ms)
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    titleTranslate.value = withDelay(500, withSpring(0, { damping: 15 }));

    // 3. Cards staggered at 700 / 850 / 1000ms
    card1Opacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    card1Translate.value = withDelay(700, withSpring(0, { damping: 15 }));
    card2Opacity.value = withDelay(850, withTiming(1, { duration: 400 }));
    card2Translate.value = withDelay(850, withSpring(0, { damping: 15 }));
    card3Opacity.value = withDelay(1000, withTiming(1, { duration: 400 }));
    card3Translate.value = withDelay(1000, withSpring(0, { damping: 15 }));

    // 4. Footer (1200ms)
    footerScale.value = withDelay(1200, withSpring(1, { damping: 12 }));

    // Subtle pulse on checkmark
    pulseAnim.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, []);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: checkScale.value * pulseAnim.value },
      { rotate: `${checkRotate.value}deg` },
    ],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslate.value }],
  }));

  const cardAnimatedStyles = [
    useAnimatedStyle(() => ({ opacity: card1Opacity.value, transform: [{ translateY: card1Translate.value }] })),
    useAnimatedStyle(() => ({ opacity: card2Opacity.value, transform: [{ translateY: card2Translate.value }] })),
    useAnimatedStyle(() => ({ opacity: card3Opacity.value, transform: [{ translateY: card3Translate.value }] })),
  ];

  const footerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: footerScale.value }],
  }));

  const handleStart = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Reset tour flags so they show after onboarding
      await AsyncStorage.removeItem('hasSeenWorkoutTour');
      await AsyncStorage.removeItem('hasSeenHomeTour');
      const updatedUser = await completeUserOnboarding(user.supabaseId);
      setUser(updatedUser);
      router.replace('/(tabs)/workout');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
      setLoading(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'Champion';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header: Checkmark + Title */}
        <View style={styles.headerSection}>
          <View style={styles.checkmarkWrapper}>
            <Animated.View
              style={[
                styles.expandingRing,
                { borderColor: colors.accent },
                ringAnimatedStyle,
              ]}
            />
            <Animated.View
              style={[
                styles.checkmarkContainer,
                { backgroundColor: colors.accent, shadowColor: colors.accent },
                checkAnimatedStyle,
              ]}
            >
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </Animated.View>
          </View>

          <Animated.View style={titleAnimatedStyle}>
            <Text style={[styles.title, { color: colors.text }]}>
              You're all set, {firstName}!
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Here's how you can work out
            </Text>
          </Animated.View>
        </View>

        {/* Step indicators */}
        <View style={styles.stepsContainer}>
          {[1, 2, 3, 4].map((step, index) => (
            <View key={step} style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepDot,
                  { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
              {index < 3 && (
                <View style={[styles.stepLine, { backgroundColor: colors.accent }]} />
              )}
            </View>
          ))}
        </View>

        {/* Educational Cards */}
        <View style={styles.cardsSection}>
          {CARDS.map((card, index) => (
            <Animated.View
              key={card.title}
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardBackground,
                  shadowColor: colors.shadow,
                },
                cardAnimatedStyles[index],
              ]}
            >
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: colors[card.iconBgKey] + '15' },
                ]}
              >
                <Ionicons name={card.icon} size={26} color={colors[card.iconBgKey]} />
              </View>
              <View style={styles.cardTextContainer}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {card.title}
                  </Text>
                  {card.badge && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors[card.badgeColorKey] + '15' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: colors[card.badgeColorKey] },
                        ]}
                      >
                        {card.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardDescription, { color: colors.text }]}>
                  {card.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Footer pinned below ScrollView */}
      <Animated.View style={[styles.footer, footerAnimatedStyle]}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            loading && styles.disabledButton,
          ]}
          onPress={handleStart}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
            {loading ? 'Setting up...' : 'Start Your Journey'}
          </Text>
          {!loading && (
            <Ionicons
              name="arrow-forward"
              size={20}
              color={colors.onPrimary}
              style={styles.buttonIcon}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
  },
  // Header
  headerSection: {
    alignItems: 'center',
    marginTop: 32,
  },
  checkmarkWrapper: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  expandingRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
  },
  checkmarkContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
  },
  // Steps
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  // Cards
  cardsSection: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.6,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
