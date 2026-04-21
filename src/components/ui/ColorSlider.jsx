import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SLIDER_HEIGHT = 36;
const THUMB_SIZE = 28;
const RAINBOW_COLORS = [
  '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000',
];

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function hexToHue(hex) {
  if (!hex) return 0;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return h;
}

const ColorSlider = ({ value, onColorChange, style }) => {
  const barRef = useRef(null);
  const barWidth = useRef(0);
  const barPageX = useRef(0);
  const [thumbX, setThumbX] = useState(0);
  const [layoutReady, setLayoutReady] = useState(false);

  const updateFromPageX = useCallback((pageX) => {
    const w = barWidth.current;
    if (w <= 0) return;
    const x = pageX - barPageX.current;
    const clamped = Math.max(0, Math.min(x, w));
    setThumbX(clamped);
    const hue = Math.round((clamped / w) * 360);
    onColorChange(hslToHex(hue, 70, 55));
  }, [onColorChange]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        barRef.current?.measure?.((x, y, width, height, pageX) => {
          barPageX.current = pageX;
          barWidth.current = width;
          updateFromPageX(evt.nativeEvent.pageX);
        });
      },
      onPanResponderMove: (evt) => {
        updateFromPageX(evt.nativeEvent.pageX);
      },
    })
  ).current;

  const handleLayout = useCallback((e) => {
    const w = e.nativeEvent.layout.width;
    barWidth.current = w;
    const hue = hexToHue(value);
    setThumbX((hue / 360) * w);
    setLayoutReady(true);
  }, [value]);

  return (
    <View style={[styles.wrapper, style]}>
      <View
        ref={barRef}
        style={styles.barContainer}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={RAINBOW_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
        {layoutReady && (
          <View
            style={[
              styles.thumb,
              {
                left: thumbX - THUMB_SIZE / 2,
                backgroundColor: value || '#FF0000',
              },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  barContainer: {
    width: '100%',
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
    overflow: 'visible',
    justifyContent: 'center',
  },
  gradient: {
    width: '100%',
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ColorSlider;
