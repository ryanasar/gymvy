import { Platform } from 'react-native';

// Live Activity feature is currently disabled for end-users.
// Flip to true (and rebuild native) to re-enable.
const LIVE_ACTIVITY_ENABLED = false;

let NativeLiveActivity = null;

if (LIVE_ACTIVITY_ENABLED && Platform.OS === 'ios') {
  try {
    const { requireOptionalNativeModule } = require('expo-modules-core');
    NativeLiveActivity = requireOptionalNativeModule('LiveActivityModule');
  } catch (e) {
    // Native module not available
  }
}

const LiveActivity = {
  isSupported: () => {
    if (!NativeLiveActivity) return false;
    try {
      return NativeLiveActivity.isSupported();
    } catch {
      return false;
    }
  },

  startWorkout: (workoutName, exerciseName, setInfo, weight, reps) => {
    if (!NativeLiveActivity) return;
    NativeLiveActivity.startWorkout(
      workoutName || 'Workout',
      exerciseName || '',
      setInfo || '',
      weight || 0,
      reps || 0
    ).catch(() => {});
  },

  updateExercise: (exerciseName, setInfo, weight, reps) => {
    if (!NativeLiveActivity) return;
    NativeLiveActivity.updateExercise(
      exerciseName || '',
      setInfo || '',
      weight || 0,
      reps || 0
    ).catch(() => {});
  },

  startRest: (remainingSeconds) => {
    if (!NativeLiveActivity) return;
    NativeLiveActivity.startRest(remainingSeconds || 0).catch(() => {});
  },

  updateRest: (remainingSeconds) => {
    if (!NativeLiveActivity) return;
    NativeLiveActivity.updateRest(remainingSeconds || 0).catch(() => {});
  },

  endRest: () => {
    if (!NativeLiveActivity) return;
    NativeLiveActivity.endRest().catch(() => {});
  },

  stopWorkout: () => {
    if (!NativeLiveActivity) return;
    NativeLiveActivity.stopWorkout().catch(() => {});
  },

  isActive: async () => {
    if (!NativeLiveActivity) return false;
    try {
      return await NativeLiveActivity.isActive();
    } catch {
      return false;
    }
  },
};

export default LiveActivity;
