import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import SimpleLineChart from './SimpleLineChart';
import LogWeightModal from './LogWeightModal';
import TimeRangeToggle from './TimeRangeToggle';
import { filterDataByRange, calculateChange, formatLastLogged } from '@/utils/timeRangeUtils';
import StatCard from '@/components/ui/StatCard';
import { fromLbs, formatWeight, getUnitLabel } from '@/utils/weightUnits';

const BodyWeightCard = ({ data, onLogWeight, weightUnit = 'lbs' }) => {
  const colors = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState('All');

  const unitLabel = getUnitLabel(weightUnit);

  // Convert data to chart format (convert from stored lbs to display unit) and filter by range
  const allChartData = useMemo(() => {
    return data ? data.map(e => ({ value: fromLbs(e.weight, weightUnit), date: e.date })) : [];
  }, [data, weightUnit]);

  const filteredData = useMemo(() => {
    return filterDataByRange(allChartData, selectedRange);
  }, [allChartData, selectedRange]);

  const latestWeight = allChartData.length > 0 ? allChartData[allChartData.length - 1].value : null;
  const lastLoggedDate = allChartData.length > 0 ? allChartData[allChartData.length - 1].date : null;
  const change = calculateChange(filteredData);

  const handleSave = (weight) => {
    onLogWeight(weight);
  };

  const chartComponent = filteredData.length > 0 ? (
    <SimpleLineChart
      data={filteredData}
      lineColor={colors.primary}
      colors={colors}
    />
  ) : (
    <View style={[styles.emptyChart, { backgroundColor: colors.background }]}>
      <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
        {allChartData.length > 0 ? 'No data in selected range' : 'Log your weight to start tracking'}
      </Text>
    </View>
  );

  const actionButton = (
    <TouchableOpacity
      style={[styles.logButton, { backgroundColor: colors.primary }]}
      onPress={() => setModalVisible(true)}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={18} color={colors.onPrimary} />
      <Text style={[styles.logButtonText, { color: colors.onPrimary }]}>Log Weight</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <StatCard
        title="Body Weight"
        headerAction={
          <TimeRangeToggle selectedRange={selectedRange} onRangeChange={setSelectedRange} />
        }
        label="Current"
        value={latestWeight !== null ? `${latestWeight} ${unitLabel}` : null}
        change={change !== null ? `${change >= 0 ? '+' : ''}${change} ${unitLabel}` : null}
        changeColor={colors.accent}
        lastLogged={lastLoggedDate ? `Last logged: ${formatLastLogged(lastLoggedDate)}` : null}
        emptyMessage="No entries yet"
        chart={chartComponent}
        actionButton={actionButton}
      />

      <LogWeightModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        weightUnit={weightUnit}
      />
    </>
  );
};

export default BodyWeightCard;

const styles = StyleSheet.create({
  emptyChart: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
    marginTop: 12,
  },
  logButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
