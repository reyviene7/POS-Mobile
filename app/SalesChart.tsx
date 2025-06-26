import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Toast from 'react-native-toast-message';
import api from '../api';

const screenWidth = Dimensions.get('window').width;

interface WeeklySalesDTO {
  dayOfWeek: string;
  date: string;
  totalSales: number;
}

export default function SalesChart() {
  const [chartData, setChartData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklySales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/sales-history/weekly');
      console.log('Weekly sales response:', response.data);
      const weeklySales: WeeklySalesDTO[] = response.data;

      // Initialize data array with zeros for all days
      const salesData = [0, 0, 0, 0, 0, 0, 0];
      const dayMap: { [key: string]: number } = {
        Mon: 0,
        Tue: 1,
        Wed: 2,
        Thu: 3,
        Fri: 4,
        Sat: 5,
        Sun: 6,
      };

      // Populate sales data based on dayOfWeek
      weeklySales.forEach((item) => {
        const index = dayMap[item.dayOfWeek];
        if (index !== undefined) {
          salesData[index] = item.totalSales;
        }
      });

      setChartData({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: salesData }],
      });
    } catch (err: any) {
      console.error('Error fetching weekly sales:', err.message, err.response?.data);
      setError('Failed to fetch weekly sales. Please try again.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load weekly sales.',
        position: 'top',
        visibilityTime: 2500,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklySales();
  }, []);

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

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.title}>📊 Weekly Sales Summary</Text>
      <BarChart
        data={chartData}
        width={screenWidth * 0.8}
        height={180}
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
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});