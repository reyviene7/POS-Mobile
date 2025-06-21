import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Sales() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧙 Sales Management</Text>
      <Text style={styles.subtitle}>View sales and shift summaries</Text>

      <View style={styles.grid}>
        {/* Shift Summary Button */}
        <Link href="/ShiftSummary" asChild>
          <TouchableOpacity style={[styles.button, styles.purple]}>
            <Text style={styles.buttonIcon}>🕒</Text>
            <Text style={styles.buttonText}>Shift Summary</Text>
          </TouchableOpacity>
        </Link>

        {/* Sales History Button */}
        <Link href="/SalesHistory" asChild>
          <TouchableOpacity style={[styles.button, styles.teal]}>
            <Text style={styles.buttonIcon}>📊</Text>
            <Text style={styles.buttonText}>Sales History</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    padding: 24,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4338CA',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 16,
  },
  purple: {
    backgroundColor: '#DDD6FE', // Light purple
  },
  teal: {
    backgroundColor: '#99F6E4', // Light teal
  },
  buttonIcon: {
    fontSize: 32,
    marginBottom: 8,
    color: '#1E293B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});