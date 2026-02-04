import React, { useCallback } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2;

const ZoomableImageModal = ({
  visible,
  onClose,
  imageUri,
  contentFit = 'contain',
  imageStyle,
}) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const resetZoom = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, SPRING_CONFIG);
    savedScale.value = 1;
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, []);

  const handleClose = useCallback(() => {
    resetZoom();
    onClose();
  }, [onClose, resetZoom]);

  const clampTranslation = useCallback((translationValue, scaleValue, dimension) => {
    'worklet';
    const maxTranslation = (dimension * (scaleValue - 1)) / 2;
    return Math.max(-maxTranslation, Math.min(maxTranslation, translationValue));
  }, []);

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Pan gesture for moving when zoomed
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .onUpdate((event) => {
      if (savedScale.value > 1) {
        const newTranslateX = savedTranslateX.value + event.translationX;
        const newTranslateY = savedTranslateY.value + event.translationY;
        translateX.value = clampTranslation(newTranslateX, scale.value, SCREEN_WIDTH);
        translateY.value = clampTranslation(newTranslateY, scale.value, SCREEN_HEIGHT);
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Double tap gesture for quick zoom toggle
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((event) => {
      if (scale.value > 1) {
        // Reset to 1x
        scale.value = withSpring(1, SPRING_CONFIG);
        savedScale.value = 1;
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Zoom to 2x centered on tap point
        const centerX = SCREEN_WIDTH / 2;
        const centerY = SCREEN_HEIGHT / 2;
        const offsetX = (centerX - event.x) * (DOUBLE_TAP_SCALE - 1);
        const offsetY = (centerY - event.y) * (DOUBLE_TAP_SCALE - 1);

        scale.value = withSpring(DOUBLE_TAP_SCALE, SPRING_CONFIG);
        savedScale.value = DOUBLE_TAP_SCALE;
        translateX.value = withSpring(
          clampTranslation(offsetX, DOUBLE_TAP_SCALE, SCREEN_WIDTH),
          SPRING_CONFIG
        );
        translateY.value = withSpring(
          clampTranslation(offsetY, DOUBLE_TAP_SCALE, SCREEN_HEIGHT),
          SPRING_CONFIG
        );
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  // Single tap gesture for closing (only when not zoomed)
  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => {
      if (scale.value <= 1) {
        runOnJS(handleClose)();
      }
    });

  // Combine gestures with proper exclusivity
  const composedGestures = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    Gesture.Exclusive(doubleTapGesture, singleTapGesture)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleModalClose = useCallback(() => {
    resetZoom();
    onClose();
  }, [onClose, resetZoom]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleModalClose}
    >
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.overlay}>
          <GestureDetector gesture={composedGestures}>
            <Animated.View style={[styles.imageContainer, animatedStyle]}>
              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={[styles.image, imageStyle]}
                  contentFit={contentFit}
                  transition={200}
                />
              )}
            </Animated.View>
          </GestureDetector>

          {/* Close button - always visible as fallback */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleModalClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default ZoomableImageModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
