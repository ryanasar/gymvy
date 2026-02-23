import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import SimpleLineChart from './SimpleLineChart';
import TimeRangeToggle from './TimeRangeToggle';
import { filterDataByRange, calculateChange, formatLastLogged } from '@/utils/timeRangeUtils';
import StatCard from '@/components/ui/StatCard';

const ExerciseOneRMCard = ({ exerciseName, data }) => {
  const colors = useThemeColors();
  const [selectedRange, setSelectedRange] = useState('All');

  const filteredData = useMemo(() => {
    const chartData = data ? data.map(e => ({ value: e.value, date: e.date })) : [];
    return filterDataByRange(chartData, selectedRange);
  }, [data, selectedRange]);

  const allData = data ? data.map(e => ({ value: e.value, date: e.date })) : [];
  const latestValue = allData.length > 0 ? allData[allData.length - 1].value : null;
  const lastLoggedDate = allData.length > 0 ? allData[allData.length - 1].date : null;
  const change = calculateChange(filteredData);

  // Green if positive, grey if zero/negative
  const changeColor = change !== null && change > 0 ? colors.accent : colors.secondaryText;

  const chartComponent = filteredData.length > 0 ? (
    <SimpleLineChart
      data={filteredData}
      lineColor={colors.accent}
      colors={colors}
    />
  ) : (
    <View style={[styles.emptyChart, { backgroundColor: colors.background }]}>
      <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
        {allData.length > 0 ? 'No data in selected range' : 'Complete a workout to see data'}
      </Text>
    </View>
  );

  return (
    <StatCard
      title={exerciseName}
      headerAction={
        <TimeRangeToggle selectedRange={selectedRange} onRangeChange={setSelectedRange} />
      }
      label="Est. 1RM"
      value={latestValue !== null ? `${latestValue} lbs` : null}
      change={change !== null ? `${change >= 0 ? '+' : ''}${change} lbs` : null}
      changeColor={changeColor}
      lastLogged={lastLoggedDate ? `Last logged: ${formatLastLogged(lastLoggedDate)}` : null}
      emptyMessage="No data yet"
      chart={chartComponent}
    />
  );
};

export default ExerciseOneRMCard;

const styles = StyleSheet.create({
  emptyChart: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
  },
});
