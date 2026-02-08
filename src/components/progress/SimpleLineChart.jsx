import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const Y_AXIS_WIDTH = 44;
const CHART_PADDING = 20;
const CARD_HORIZONTAL_PADDING = 16; // StatCard padding
const SCREEN_HORIZONTAL_PADDING = 8; // scrollContent padding
// Chart width = screen - scrollPadding*2 - cardPadding*2 - yAxisWidth
const defaultChartWidth = screenWidth - (SCREEN_HORIZONTAL_PADDING * 2) - (CARD_HORIZONTAL_PADDING * 2) - Y_AXIS_WIDTH;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return `${month}/${day}`;
};

// Helper to create smooth bezier curve path
const createSmoothPath = (points) => {
  if (points.length < 2) return '';

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;

    // Use quadratic bezier for smoother curves
    path += ` Q ${current.x + (midX - current.x) * 0.5} ${current.y}, ${midX} ${(current.y + next.y) / 2}`;
    path += ` Q ${midX + (next.x - midX) * 0.5} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
};

// Create filled area path for gradient
const createAreaPath = (points, chartHeight) => {
  if (points.length < 2) return '';

  const linePath = createSmoothPath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  // Close the path to create a filled area
  return `${linePath} L ${lastPoint.x} ${chartHeight - CHART_PADDING} L ${firstPoint.x} ${chartHeight - CHART_PADDING} Z`;
};

const SimpleLineChart = ({ data, lineColor, colors, chartHeight = 180 }) => {
  const chartWidth = defaultChartWidth;
  const innerHeight = chartHeight - CHART_PADDING * 2;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyChart, { height: chartHeight, backgroundColor: colors.background }]}>
        <Text style={[styles.emptyChartText, { color: colors.secondaryText }]}>No data available</Text>
      </View>
    );
  }

  const values = data.map(d => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const isSingleValue = rawMin === rawMax;

  // Add 10% padding to the range for better visualization
  const rangePadding = isSingleValue ? Math.max(rawMax * 0.1, 5) : (rawMax - rawMin) * 0.1;
  const minValue = rawMin - rangePadding;
  const maxValue = rawMax + rangePadding;
  const range = maxValue - minValue;

  const singlePoint = data.length === 1;

  // Calculate average value
  const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;

  // Calculate inner chart dimensions (area where data is drawn)
  const innerWidth = chartWidth - CHART_PADDING * 2;

  const points = data.map((item, index) => {
    const x = singlePoint
      ? CHART_PADDING + innerWidth / 2
      : CHART_PADDING + (index / (data.length - 1)) * innerWidth;
    const y = CHART_PADDING + ((maxValue - item.value) / range) * innerHeight;
    return { x, y, value: item.value, date: item.date };
  });

  const latestPoint = points[points.length - 1];

  // Calculate Y position for average line
  const avgY = CHART_PADDING + ((maxValue - avgValue) / range) * innerHeight;

  // Pick X-axis date labels - evenly distributed across the time range
  const dateLabels = [];

  if (data.length === 1) {
    dateLabels.push(formatDate(data[0].date));
  } else {
    // Parse first and last dates
    const firstDateStr = data[0].date;
    const lastDateStr = data[data.length - 1].date;
    const [fy, fm, fd] = firstDateStr.split('-').map(Number);
    const firstDate = new Date(fy, fm - 1, fd);
    const [ly, lm, ld] = lastDateStr.split('-').map(Number);
    const lastDate = new Date(ly, lm - 1, ld);
    const totalDays = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));

    // Always use 3 labels: start, middle, end
    const numLabels = 3;

    for (let i = 0; i < numLabels; i++) {
      const fraction = i / (numLabels - 1);
      const daysFromStart = Math.round(fraction * totalDays);
      const labelDate = new Date(firstDate);
      labelDate.setDate(labelDate.getDate() + daysFromStart);

      const month = labelDate.getMonth() + 1;
      const day = labelDate.getDate();
      dateLabels.push(`${month}/${day}`);
    }
  }

  // Create gradient ID from color
  const gradientId = `gradient-${lineColor.replace('#', '')}`;

  return (
    <View>
      <View style={[styles.chartContainer, { height: chartHeight }]}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={[styles.axisLabel, { color: colors.secondaryText }]}>
            {Math.round(maxValue)}
          </Text>
          <Text style={[styles.axisLabel, { color: colors.secondaryText }]}>
            {Math.round(avgValue)}
          </Text>
          <Text style={[styles.axisLabel, { color: colors.secondaryText }]}>
            {Math.round(minValue)}
          </Text>
        </View>

        {/* Chart area */}
        <View style={[styles.chartArea, { backgroundColor: colors.background }]}>
          {/* Grid lines */}
          <View style={[styles.gridLine, { top: CHART_PADDING, backgroundColor: colors.borderLight }]} />
          <View style={[styles.gridLine, { top: avgY, backgroundColor: colors.borderLight, opacity: 0.7 }]} />
          <View style={[styles.gridLine, { top: chartHeight - CHART_PADDING, backgroundColor: colors.borderLight }]} />

          {/* SVG Chart */}
          <Svg width={chartWidth} height={chartHeight} style={styles.svgChart}>
            <Defs>
              <LinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
              </LinearGradient>
            </Defs>

            {/* Gradient fill area */}
            {!singlePoint && (
              <Path
                d={createAreaPath(points, chartHeight)}
                fill={`url(#${gradientId})`}
              />
            )}

            {/* Main line */}
            {!singlePoint && (
              <Path
                d={createSmoothPath(points)}
                stroke={lineColor}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points - smaller dots for intermediate points */}
            {points.map((point, index) => {
              const isLatest = index === points.length - 1;

              if (isLatest) return null; // Rendered separately with glow

              return (
                <Circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={3}
                  fill={lineColor}
                  opacity={0.6}
                />
              );
            })}

            {/* Latest point with glow effect */}
            <Circle
              cx={latestPoint.x}
              cy={latestPoint.y}
              r={12}
              fill={lineColor}
              opacity={0.15}
            />
            <Circle
              cx={latestPoint.x}
              cy={latestPoint.y}
              r={8}
              fill={lineColor}
              opacity={0.25}
            />
            <Circle
              cx={latestPoint.x}
              cy={latestPoint.y}
              r={5}
              fill={lineColor}
            />
          </Svg>
        </View>
      </View>

      {/* X-axis date labels */}
      <View style={styles.xAxisRow}>
        <View style={styles.xAxisSpacer} />
        <View style={[styles.xAxisLabels, dateLabels.length === 1 && { justifyContent: 'center' }]}>
          {dateLabels.map((label, i) => (
            <Text
              key={i}
              style={[
                styles.xAxisLabel,
                {
                  color: colors.secondaryText,
                  textAlign: dateLabels.length === 1 ? 'center' : (i === 0 ? 'left' : i === dateLabels.length - 1 ? 'right' : 'center'),
                },
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>

    </View>
  );
};

export default SimpleLineChart;

const styles = StyleSheet.create({
  chartContainer: {
    flexDirection: 'row',
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingVertical: CHART_PADDING,
    width: Y_AXIS_WIDTH,
    alignItems: 'flex-end',
  },
  axisLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  svgChart: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gridLine: {
    position: 'absolute',
    left: CHART_PADDING,
    right: CHART_PADDING,
    height: 1,
  },
  xAxisRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  xAxisSpacer: {
    width: Y_AXIS_WIDTH,
  },
  xAxisLabels: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: CHART_PADDING,
  },
  xAxisLabel: {
    fontSize: 11,
    fontWeight: '500',
    minWidth: 40,
  },
  emptyChart: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyChartText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
