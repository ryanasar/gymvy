import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH;

const CAROUSEL_DATA = {
  splits: {
    slides: [
      {
        icon: 'calendar',
        iconColor: 'primary',
        title: 'Plan Your Week',
        description: 'The best way to stay consistent. Create a multi-day routine with specific exercises for each day of the week.',
      },
      {
        icon: 'today',
        iconColor: 'primary',
        title: 'Follow Your Schedule',
        description: 'The app tracks where you are and tells you exactly what to do each day — no guessing required.',
      },
      {
        icon: 'repeat',
        iconColor: 'primary',
        title: 'Stay Consistent',
        description: 'Complete each day and automatically cycle through your split week after week. Your progress carries over.',
      },
    ],
  },
  saved: {
    slides: [
      {
        icon: 'construct',
        iconColor: 'accent',
        title: 'Build Your Templates',
        description: 'Create custom workout templates with your favorite exercises, sets, and reps all dialed in.',
      },
      {
        icon: 'play-circle',
        iconColor: 'accent',
        title: 'Reuse Anytime',
        description: 'Start a saved workout with a single tap whenever you want — no need to rebuild it every time.',
      },
      {
        icon: 'trending-up',
        iconColor: 'accent',
        title: 'Track Progress',
        description: 'See how you improve over time by repeating the same workouts and comparing your performance.',
      },
    ],
  },
  freestyle: {
    slides: [
      {
        icon: 'flash',
        iconColor: 'warning',
        title: 'No Planning Needed',
        description: 'Jump right in and add exercises as you go. Great for when you want to wing it or try something new.',
      },
      {
        icon: 'infinite',
        iconColor: 'warning',
        title: 'Full Flexibility',
        description: 'Search and add any exercise mid-workout. Perfect for switching things up or exploring new movements.',
      },
    ],
  },
};

const WorkoutCarouselModal = ({ visible, onClose, cardType }) => {
  const colors = useThemeColors();
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const data = cardType ? CAROUSEL_DATA[cardType] : null;
  const slides = data?.slides || [];

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SLIDE_WIDTH);
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * SLIDE_WIDTH, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
    onClose();
  };

  if (!cardType || !data) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
          <View style={[styles.closeButtonCircle, { backgroundColor: colors.borderLight }]}>
            <Ionicons name="close" size={20} color={colors.text} />
          </View>
        </TouchableOpacity>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
        >
          {slides.map((slide, index) => (
            <View key={index} style={[styles.slide, { width: SLIDE_WIDTH }]}>
              <View style={[styles.iconCircle, { backgroundColor: colors[slide.iconColor] + '15' }]}>
                <Ionicons name={slide.icon} size={60} color={colors[slide.iconColor]} />
              </View>
              <Text style={[styles.slideTitle, { color: colors.text }]}>{slide.title}</Text>
              <Text style={[styles.slideDescription, { color: colors.text }]}>{slide.description}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Dot indicators */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === activeIndex ? colors.primary : colors.borderLight,
                  width: index === activeIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Bottom button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextButtonText, { color: colors.onPrimary }]}>
              {activeIndex === slides.length - 1 ? 'Got it' : 'Next'}
            </Text>
            {activeIndex < slides.length - 1 && (
              <Ionicons name="arrow-forward" size={20} color={colors.onPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 16 : 40,
    right: 20,
    zIndex: 10,
  },
  closeButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  nextButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.3,
  },
});

export default WorkoutCarouselModal;
