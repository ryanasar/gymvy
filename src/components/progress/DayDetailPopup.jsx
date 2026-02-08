import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getWorkoutSessionById } from '@/services/api/workoutSessions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DayDetailPopup = ({ visible, dayData, position, onClose }) => {
  const colors = useThemeColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // State for fetched session details
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Track if we're in the middle of closing animation to prevent re-triggers
  const [isClosing, setIsClosing] = useState(false);

  // Handle close with fade-out animation
  const handleClose = () => {
    if (isClosing) return; // Prevent multiple close triggers

    setIsClosing(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setIsClosing(false);
    });
  };

  useEffect(() => {
    if (visible && !isClosing) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
      // Reset session details when closing
      setSessionDetails(null);
    }
  }, [visible]);

  // Fetch full workout session when popup opens for a workout day with sessionId
  useEffect(() => {
    if (visible && dayData?.workoutSessionId && !dayData.isRestDay && !dayData.isFreeRestDay) {
      setLoading(true);
      getWorkoutSessionById(dayData.workoutSessionId)
        .then(session => {
          setSessionDetails(session);
        })
        .catch(err => {
          console.error('[DayDetailPopup] Failed to fetch session:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible, dayData?.workoutSessionId, dayData?.isRestDay, dayData?.isFreeRestDay]);

  if (!visible || !dayData) return null;

  const isRestDay = dayData.isRestDay;
  const isFreeRestDay = dayData.isFreeRestDay;

  // Use sessionDetails if available, otherwise fall back to dayData
  const displayData = sessionDetails || dayData;

  // Calculate muscle groups from session sets if we have detailed data
  let muscleGroupsText = null;
  if (sessionDetails?.sets) {
    // Group sets by exercise to get unique exercise names
    const uniqueExercises = [...new Set(sessionDetails.sets.map(s => s.exerciseName))];
    if (uniqueExercises.length > 0) {
      // Show first 3 exercise names as preview
      muscleGroupsText = uniqueExercises.slice(0, 3).join(', ');
      if (uniqueExercises.length > 3) {
        muscleGroupsText += ` +${uniqueExercises.length - 3} more`;
      }
    }
  } else if (dayData.muscleGroups?.length > 0) {
    muscleGroupsText = dayData.muscleGroups.join(', ');
  }

  // Calculate stats from session if available
  let totalExercises = displayData.totalExercises;
  let totalSets = displayData.totalSets;

  if (sessionDetails?.sets) {
    const exerciseSet = new Set(sessionDetails.sets.map(s => s.exerciseName));
    totalExercises = exerciseSet.size;
    totalSets = sessionDetails.sets.length;
  }

  // Format stats line
  const statsItems = [];
  if (displayData.durationMinutes) {
    statsItems.push(`${displayData.durationMinutes} min`);
  }
  if (totalExercises) {
    statsItems.push(`${totalExercises} exercises`);
  }
  if (totalSets) {
    statsItems.push(`${totalSets} sets`);
  }
  const statsText = statsItems.join(' • ');

  // Determine popup title
  let title = 'Workout';
  if (isFreeRestDay) {
    title = 'Free Rest Day';
  } else if (isRestDay) {
    title = 'Rest Day';
  } else if (dayData.workoutName) {
    // Include emoji if available
    title = dayData.splitEmoji ? `${dayData.splitEmoji} ${dayData.workoutName}` : dayData.workoutName;
  } else if (dayData.splitName) {
    title = dayData.splitEmoji ? `${dayData.splitEmoji} ${dayData.splitName}` : dayData.splitName;
  }

  // Calculate safe position (keep popup on screen)
  const popupWidth = 200;
  const safeLeft = Math.max(16, Math.min(position?.left || 16, SCREEN_WIDTH - popupWidth - 16));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.popup,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.borderLight,
                  shadowColor: colors.shadow,
                  top: position?.top,
                  left: safeLeft,
                  transform: [{ scale: scaleAnim }],
                }
              ]}
            >
              {/* Arrow pointing down to the day */}
              <View
                style={[
                  styles.arrow,
                  {
                    borderTopColor: colors.cardBackground,
                    left: Math.max(10, Math.min((position?.left || 0) - safeLeft + 8, popupWidth - 30)),
                  }
                ]}
              />

              {/* Content */}
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>

              {!isRestDay && !isFreeRestDay && (
                <>
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={colors.secondaryText} />
                    </View>
                  ) : (
                    <>
                      {muscleGroupsText && (
                        <Text style={[styles.muscleGroups, { color: colors.secondaryText }]} numberOfLines={2}>
                          {muscleGroupsText}
                        </Text>
                      )}
                      {statsText && (
                        <Text style={[styles.stats, { color: colors.secondaryText }]}>
                          {statsText}
                        </Text>
                      )}
                    </>
                  )}
                </>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DayDetailPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  popup: {
    position: 'absolute',
    minWidth: 180,
    maxWidth: 240,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  muscleGroups: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.8,
  },
  stats: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.7,
  },
  loadingContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});
