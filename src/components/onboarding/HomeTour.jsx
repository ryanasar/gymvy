import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TOUR_STEPS = [
  {
    targetKey: 'homeHeader',
    text: 'Your feed',
    description: "This is where you'll see workout posts from people you follow. Follow more people to fill your feed!",
  },
  {
    targetKey: 'searchButton',
    text: 'Find people to follow',
    description: 'Search for friends by name or username and follow them to see their workouts here.',
  },
  {
    targetKey: 'notificationsButton',
    text: 'Stay in the loop',
    description: 'See when someone follows you, likes your workout, or comments on your post.',
  },
];

const HomeTour = ({ visible, onComplete, onSkip, targetRefs }) => {
  const colors = useThemeColors();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetLayout, setTargetLayout] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const tooltipOpacity = useSharedValue(0);
  const tooltipTranslate = useSharedValue(10);

  const retryCountRef = React.useRef(0);

  const measureTarget = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    const ref = targetRefs?.[step.targetKey];

    if (ref?.current) {
      ref.current.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          retryCountRef.current = 0;
          setTargetLayout({ x, y, width, height });
          setIsReady(true);
          tooltipOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
          tooltipTranslate.value = withDelay(100, withSpring(0, { damping: 15 }));
        } else if (retryCountRef.current < 5) {
          retryCountRef.current += 1;
          setTimeout(measureTarget, 300);
        }
      });
    } else if (retryCountRef.current < 5) {
      retryCountRef.current += 1;
      setTimeout(measureTarget, 300);
    }
  }, [currentStep, targetRefs]);

  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
      setIsReady(false);
      setTargetLayout(null);
      retryCountRef.current = 0;
      return;
    }

    retryCountRef.current = 0;

    const timer = setTimeout(measureTarget, 400);
    return () => clearTimeout(timer);
  }, [visible, currentStep, measureTarget]);

  const handleNext = () => {
    tooltipOpacity.value = withTiming(0, { duration: 150 });
    tooltipTranslate.value = withTiming(10, { duration: 150 });
    setIsReady(false);
    setTargetLayout(null);

    if (currentStep < TOUR_STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 200);
    } else {
      onComplete();
    }
  };

  const tooltipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
    transform: [{ translateY: tooltipTranslate.value }],
  }));

  if (!visible || !isReady || !targetLayout) {
    if (visible && !isReady) {
      return (
        <View style={styles.overlay} pointerEvents="box-none">
          <View style={[styles.overlayBackground, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        </View>
      );
    }
    return null;
  }

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const tooltipBelow = targetLayout.y + targetLayout.height + 12;
  const tooltipAbove = targetLayout.y - 12;
  const showBelow = tooltipBelow + 120 < SCREEN_HEIGHT;
  const tooltipTop = showBelow ? tooltipBelow : undefined;
  const tooltipBottom = showBelow ? undefined : SCREEN_HEIGHT - tooltipAbove;

  const arrowLeft = Math.min(
    Math.max(targetLayout.x + targetLayout.width / 2 - 8, 32),
    SCREEN_WIDTH - 48
  );

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.overlayBackground, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
        activeOpacity={1}
        onPress={handleNext}
      />

      {/* Highlight cutout */}
      <View
        style={[
          styles.highlight,
          {
            top: targetLayout.y - 4,
            left: targetLayout.x - 4,
            width: targetLayout.width + 8,
            height: targetLayout.height + 8,
            borderRadius: 16,
            borderColor: colors.primary + '40',
          },
        ]}
        pointerEvents="none"
      />

      {/* Tooltip bubble */}
      <Animated.View
        style={[
          styles.tooltip,
          {
            backgroundColor: colors.cardBackground,
            shadowColor: colors.shadow,
            top: tooltipTop,
            bottom: tooltipBottom,
            left: 20,
            right: 20,
          },
          tooltipAnimatedStyle,
        ]}
      >
        {/* Arrow */}
        <View
          style={[
            showBelow ? styles.arrowUp : styles.arrowDown,
            {
              borderBottomColor: showBelow ? colors.cardBackground : undefined,
              borderTopColor: showBelow ? undefined : colors.cardBackground,
              left: arrowLeft - 20,
            },
          ]}
        />

        <Text style={[styles.tooltipText, { color: colors.text }]}>{step.text}</Text>
        {step.description && (
          <Text style={[styles.tooltipDescription, { color: colors.secondaryText }]}>{step.description}</Text>
        )}

        <View style={styles.tooltipFooter}>
          <Text style={[styles.stepCounter, { color: colors.secondaryText }]}>
            {currentStep + 1} of {TOUR_STEPS.length}
          </Text>
          <View style={styles.tooltipActions}>
            {!isLast && (
              <TouchableOpacity onPress={onSkip} activeOpacity={0.7}>
                <Text style={[styles.skipText, { color: colors.secondaryText }]}>Skip tour</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={[styles.nextButtonText, { color: colors.onPrimary }]}>
                {isLast ? 'Done' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 10,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  highlight: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    borderRadius: 16,
    padding: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  arrowUp: {
    position: 'absolute',
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowDown: {
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
  tooltipText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 6,
  },
  tooltipDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  tooltipFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCounter: {
    fontSize: 13,
    fontWeight: '500',
  },
  tooltipActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default HomeTour;
