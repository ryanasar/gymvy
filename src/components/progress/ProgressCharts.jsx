import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Radius, Spacing, FontSize, FontWeight, Layout } from '@/constants/theme';

const chartHeight = 180;

const ProgressCharts = ({ weightData = [], oneRMData = [], volumeData = [] }) => {
  const colors = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.min(screenWidth - 80, Layout.maxContentWidth - 80);
  const [weightTimeframe, setWeightTimeframe] = useState('3M');
  const [oneRMTimeframe, setOneRMTimeframe] = useState('3M');
  const [volumeTimeframe, setVolumeTimeframe] = useState('3M');

  const TimeframeToggle = ({ timeframe, setTimeframe }) => (
    <View style={[styles.timeframeToggle, { backgroundColor: colors.borderLight }]}>
      {['1M', '3M', '6M', '1Y'].map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.timeframeButton,
            timeframe === option && { backgroundColor: colors.primary }
          ]}
          onPress={() => setTimeframe(option)}
        >
          <Text
            style={[
              styles.timeframeButtonText,
              { color: colors.secondaryText },
              timeframe === option && { color: colors.onPrimary }
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const SimpleLineChart = ({ data, color = colors.primary }) => {
    if (!data || data.length === 0) {
      return (
        <View style={[styles.emptyChart, { backgroundColor: colors.background }]}>
          <Text style={[styles.emptyChartText, { color: colors.secondaryText }]}>No data available</Text>
        </View>
      );
    }

    // Calculate min and max values for scaling
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Generate points for the line
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - ((item.value - minValue) / range) * (chartHeight - 40);
      return { x, y };
    });

    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={[styles.axisLabel, { color: colors.secondaryText }]}>{Math.round(maxValue)}</Text>
          <Text style={[styles.axisLabel, { color: colors.secondaryText }]}>{Math.round((maxValue + minValue) / 2)}</Text>
          <Text style={[styles.axisLabel, { color: colors.secondaryText }]}>{Math.round(minValue)}</Text>
        </View>

        {/* Chart area */}
        <View style={[styles.chartArea, { backgroundColor: colors.background }]}>
          {/* Grid lines */}
          <View style={[styles.gridLine, { backgroundColor: colors.borderLight }]} />
          <View style={[styles.gridLine, { backgroundColor: colors.borderLight, top: '50%' }]} />
          <View style={[styles.gridLine, { backgroundColor: colors.borderLight, top: '100%' }]} />

          {/* Data points */}
          {points.map((point, index) => (
            <View
              key={index}
              style={[
                styles.dataPoint,
                {
                  left: point.x,
                  top: point.y,
                  backgroundColor: color,
                }
              ]}
            />
          ))}

          {/* Connect lines between points */}
          {points.map((point, index) => {
            if (index === points.length - 1) return null;
            const nextPoint = points[index + 1];
            const length = Math.sqrt(
              Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
            );
            const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

            return (
              <View
                key={`line-${index}`}
                style={[
                  styles.dataLine,
                  {
                    left: point.x,
                    top: point.y,
                    width: length,
                    transform: [{ rotate: `${angle}deg` }],
                    backgroundColor: color,
                  }
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Weight Over Time Chart */}
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Weight Over Time</Text>
            <Text style={[styles.cardSubtitle, { color: colors.secondaryText }]}>Track your strength progression</Text>
          </View>
          <TimeframeToggle timeframe={weightTimeframe} setTimeframe={setWeightTimeframe} />
        </View>
        <SimpleLineChart data={weightData} color={colors.primary} />
      </View>

      {/* Estimated 1RM Trend */}
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Estimated 1RM Trend</Text>
            <Text style={[styles.cardSubtitle, { color: colors.secondaryText }]}>Your maximum strength estimate</Text>
          </View>
          <TimeframeToggle timeframe={oneRMTimeframe} setTimeframe={setOneRMTimeframe} />
        </View>
        <SimpleLineChart data={oneRMData} color={colors.error} />
      </View>

      {/* Weekly Volume */}
      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Weekly Volume</Text>
            <Text style={[styles.cardSubtitle, { color: colors.secondaryText }]}>Total weight lifted per week</Text>
          </View>
          <TimeframeToggle timeframe={volumeTimeframe} setTimeframe={setVolumeTimeframe} />
        </View>
        <SimpleLineChart data={volumeData} color={colors.accent} />
      </View>
    </View>
  );
};

export default ProgressCharts;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.container,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.container,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: FontWeight.medium,
  },
  timeframeToggle: {
    flexDirection: 'row',
    borderRadius: Radius.sm,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeframeButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  chartContainer: {
    flexDirection: 'row',
    height: chartHeight,
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.container,
    width: 40,
  },
  axisLabel: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    borderRadius: Radius.md,
    padding: Spacing.container,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    top: 0,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
    marginTop: -4,
  },
  dataLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  emptyChart: {
    height: chartHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  emptyChartText: {
    fontSize: FontSize.body,
  },
});
