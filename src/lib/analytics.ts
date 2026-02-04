import PostHog from 'posthog-react-native';

// Initialize PostHog - will be set up by AnalyticsProvider
let posthog: PostHog | null = null;

export const setPostHogInstance = (instance: PostHog) => {
  posthog = instance;
};

export const getPostHogInstance = () => posthog;

// ============================================
// EVENT DEFINITIONS
// Organized by category for easy reference
// ============================================

// Helper to safely track events
const track = (event: string, properties?: Record<string, any>) => {
  if (posthog) {
    posthog.capture(event, properties);
  } else {
    console.warn('[Analytics] PostHog not initialized, skipping event:', event);
  }
};

// ============================================
// APP LIFECYCLE EVENTS
// Answer: "Are users opening the app?"
// ============================================

export const trackAppOpened = () => {
  track('app_opened');
};

export const trackAppBackgrounded = () => {
  track('app_backgrounded');
};

// ============================================
// AUTHENTICATION EVENTS
// Answer: "How are users signing up/in?"
// ============================================

export const trackSignUpStarted = (method: 'google' | 'apple') => {
  track('signup_started', { method });
};

export const trackSignUpCompleted = (method: 'google' | 'apple') => {
  track('signup_completed', { method });
};

export const trackSignInCompleted = (method: 'google' | 'apple') => {
  track('signin_completed', { method });
};

export const trackSignOutCompleted = () => {
  track('signout_completed');
};

// ============================================
// ONBOARDING EVENTS
// Answer: "Are users completing onboarding?"
// ============================================

export const trackOnboardingStarted = () => {
  track('onboarding_started');
};

export const trackOnboardingStepCompleted = (step: string, stepNumber: number) => {
  track('onboarding_step_completed', { step, step_number: stepNumber });
};

export const trackOnboardingCompleted = () => {
  track('onboarding_completed');
};

export const trackOnboardingSkipped = (atStep: string) => {
  track('onboarding_skipped', { at_step: atStep });
};

// ============================================
// WORKOUT EVENTS
// Answer: "Are users logging workouts?"
// ============================================

export const trackWorkoutStarted = (source?: 'new' | 'template' | 'plan') => {
  track('workout_started', { source: source || 'new' });
};

export const trackSetLogged = (properties: {
  exerciseName: string;
  muscleGroup?: string;
  setNumber: number;
  weight?: number;
  reps?: number;
}) => {
  track('set_logged', {
    exercise_name: properties.exerciseName,
    muscle_group: properties.muscleGroup,
    set_number: properties.setNumber,
    weight: properties.weight,
    reps: properties.reps,
  });
};

export const trackExerciseAdded = (properties: {
  exerciseName: string;
  muscleGroup?: string;
  source?: 'search' | 'recent' | 'suggested';
}) => {
  track('exercise_added', {
    exercise_name: properties.exerciseName,
    muscle_group: properties.muscleGroup,
    source: properties.source,
  });
};

export const trackWorkoutCompleted = (properties: {
  durationSeconds: number;
  exerciseCount: number;
  totalSets: number;
  totalVolume?: number;
}) => {
  track('workout_completed', {
    duration_seconds: properties.durationSeconds,
    exercise_count: properties.exerciseCount,
    total_sets: properties.totalSets,
    total_volume: properties.totalVolume,
  });
};

export const trackWorkoutDiscarded = (properties: {
  durationSeconds: number;
  exerciseCount: number;
}) => {
  track('workout_discarded', {
    duration_seconds: properties.durationSeconds,
    exercise_count: properties.exerciseCount,
  });
};

// ============================================
// PR (PERSONAL RECORD) EVENTS
// Answer: "Are users hitting PRs?"
// ============================================

export const trackPRHit = (properties: {
  exerciseName: string;
  type: 'weight' | 'reps' | 'volume';
  previousValue?: number;
  newValue: number;
}) => {
  track('pr_hit', {
    exercise_name: properties.exerciseName,
    pr_type: properties.type,
    previous_value: properties.previousValue,
    new_value: properties.newValue,
  });
};

// ============================================
// SOCIAL/FEED EVENTS
// Answer: "Are users engaging socially?"
// ============================================

export const trackPostCreated = (properties?: {
  hasImage?: boolean;
  hasWorkout?: boolean;
}) => {
  track('post_created', {
    has_image: properties?.hasImage,
    has_workout: properties?.hasWorkout,
  });
};

export const trackPostLiked = () => {
  track('post_liked');
};

export const trackPostUnliked = () => {
  track('post_unliked');
};

export const trackCommentAdded = () => {
  track('comment_added');
};

export const trackProfileViewed = (isOwnProfile: boolean) => {
  track('profile_viewed', { is_own_profile: isOwnProfile });
};

export const trackUserFollowed = () => {
  track('user_followed');
};

export const trackUserUnfollowed = () => {
  track('user_unfollowed');
};

// ============================================
// SEARCH EVENTS
// Answer: "What are users searching for?"
// ============================================

export const trackSearchPerformed = (properties: {
  query: string;
  type: 'exercise' | 'user' | 'general';
  resultsCount: number;
}) => {
  track('search_performed', {
    query: properties.query,
    search_type: properties.type,
    results_count: properties.resultsCount,
  });
};

// ============================================
// PREMIUM/CONVERSION EVENTS
// Answer: "Is premium working?"
// ============================================

export const trackPaywallViewed = (triggerSource: string) => {
  track('paywall_viewed', { trigger_source: triggerSource });
};

export const trackTrialStarted = () => {
  track('trial_started');
};

export const trackSubscriptionStarted = (properties: {
  plan: string;
  price: number;
  currency?: string;
}) => {
  track('subscription_started', {
    plan: properties.plan,
    price: properties.price,
    currency: properties.currency || 'USD',
  });
};

export const trackSubscriptionCancelled = (reason?: string) => {
  track('subscription_cancelled', { reason });
};

// ============================================
// RECAP/SHARING EVENTS
// Answer: "Is the viral loop working?"
// ============================================

export const trackRecapGenerated = (properties: {
  period: 'weekly' | 'monthly' | 'yearly';
  workoutCount: number;
}) => {
  track('recap_generated', {
    period: properties.period,
    workout_count: properties.workoutCount,
  });
};

export const trackRecapViewed = (period: 'weekly' | 'monthly' | 'yearly') => {
  track('recap_viewed', { period });
};

export const trackRecapShared = (properties: {
  period: 'weekly' | 'monthly' | 'yearly';
  platform: 'instagram' | 'messages' | 'twitter' | 'other';
}) => {
  track('recap_shared', {
    period: properties.period,
    platform: properties.platform,
  });
};

// ============================================
// REFERRAL EVENTS
// Answer: "Is referral program working?"
// ============================================

export const trackReferralLinkCreated = () => {
  track('referral_link_created');
};

export const trackReferralLinkShared = (platform?: string) => {
  track('referral_link_shared', { platform });
};

export const trackReferralSignup = (referrerId: string) => {
  track('referral_signup', { referrer_id: referrerId });
};

// ============================================
// FEATURE USAGE EVENTS
// Answer: "What features are being used?"
// ============================================

export const trackFeatureUsed = (featureName: string, properties?: Record<string, any>) => {
  track('feature_used', { feature_name: featureName, ...properties });
};

export const trackTemplateCreated = () => {
  track('template_created');
};

export const trackTemplateUsed = () => {
  track('template_used');
};

// ============================================
// ERROR EVENTS
// Answer: "What's breaking?"
// ============================================

export const trackError = (properties: {
  errorType: string;
  errorMessage: string;
  screen?: string;
}) => {
  track('error_occurred', {
    error_type: properties.errorType,
    error_message: properties.errorMessage,
    screen: properties.screen,
  });
};

// ============================================
// USER IDENTIFICATION
// Call when user logs in
// ============================================

export const identifyUser = (userId: string, properties?: {
  email?: string;
  username?: string;
  createdAt?: string;
}) => {
  if (posthog) {
    posthog.identify(userId, properties);
  }
};

export const resetUser = () => {
  if (posthog) {
    posthog.reset();
  }
};
