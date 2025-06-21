import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SalesChart from './SalesChart';

export default function Sales() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📈 EggCited Sales</Text>
      <Text style={styles.subtitle}>Manage your daily egg drops</Text>

      <SalesChart />

      <View style={styles.grid}>
        {/* Shift Summary */}
        <Link href="/ShiftSummary" asChild>
          <TouchableOpacity style={[styles.card, styles.indigo]}>
            <Text style={styles.icon}>🕒</Text>
            <Text style={styles.label}>Shift Summary</Text>
          </TouchableOpacity>
        </Link>

        {/* Sales History */}
        <Link href="/SalesHistory" asChild>
          <TouchableOpacity style={[styles.card, styles.yellow]}>
            <Text style={styles.icon}>📊</Text>
            <Text style={styles.label}>Sales History</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#B45309',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16,
  },
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  indigo: {
    backgroundColor: '#C7D2FE', // Light indigo
  },
  yellow: {
    backgroundColor: '#FDE68A', // Warm yellow
  },
  icon: {
    fontSize: 36,
    marginBottom: 10,
    color: '#1F2937',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});
