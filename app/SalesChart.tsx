import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [350, 500, 650, 800, 700, 900, 1000],
    },
  ],
};

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(251, 191, 36, ${opacity})`, // Yellow
  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
  propsForBackgroundLines: {
    stroke: '#E5E7EB',
  },
  barPercentage: 0.5,
};

export default function SalesChart() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Weekly Sales Summary</Text>
      <BarChart
        data={data}
        width={screenWidth * 0.8} // smaller width (80% of screen)
        height={180} // smaller height
        yAxisLabel="₱"
        chartConfig={chartConfig}
        verticalLabelRotation={0}
        fromZero
        style={styles.chart}
        showValuesOnTopOfBars
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'center',
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    color: '#B45309',
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
});
