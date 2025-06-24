import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { generateSalesHistoryPDF } from '../src/components/GenerateSalesReport';

export default function Reports() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleGenerate = async (type: string) => {
    setLoading(type);
    try {
      if (type === 'Sales History') {
        await generateSalesHistoryPDF();
      } else {
        Alert.alert('📑 Report Generated', `${type} Report has been generated!`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to generate ${type} Report.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Reports</Text>
      <Text style={styles.subtitle}>Generate summaries and detailed insights for EggCited</Text>

      <TouchableOpacity
        style={[styles.reportButton, loading === 'Shift Summary' && styles.buttonDisabled]}
        onPress={() => handleGenerate('Shift Summary')}
        disabled={!!loading}
      >
        {loading === 'Shift Summary' ? (
          <ActivityIndicator color="#92400E" />
        ) : (
          <Text style={styles.reportText}>🕒 Shift Summary Report</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reportButton, loading === 'Sales History' && styles.buttonDisabled]}
        onPress={() => handleGenerate('Sales History')}
        disabled={!!loading}
      >
        {loading === 'Sales History' ? (
          <ActivityIndicator color="#92400E" />
        ) : (
          <Text style={styles.reportText}>📈 Sales History Report</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reportButton, loading === 'Cash Transactions' && styles.buttonDisabled]}
        onPress={() => handleGenerate('Cash Transactions')}
        disabled={!!loading}
      >
        {loading === 'Cash Transactions' ? (
          <ActivityIndicator color="#92400E" />
        ) : (
          <Text style={styles.reportText}>💰 Cash Transactions Report</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reportButton, loading === 'Credit Transactions' && styles.buttonDisabled]}
        onPress={() => handleGenerate('Credit Transactions')}
        disabled={!!loading}
      >
        {loading === 'Credit Transactions' ? (
          <ActivityIndicator color="#92400E" />
        ) : (
          <Text style={styles.reportText}>🏦 Credit Transactions Report</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reportButton, loading === 'Expenses' && styles.buttonDisabled]}
        onPress={() => handleGenerate('Expenses')}
        disabled={!!loading}
      >
        {loading === 'Expenses' ? (
          <ActivityIndicator color="#92400E" />
        ) : (
          <Text style={styles.reportText}>💸 Expenses Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF7ED',
    padding: 24,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Arial', // Use a bold, modern font if available
  },
  subtitle: {
    fontSize: 16,
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 28,
    fontStyle: 'italic',
  },
  reportButton: {
    backgroundColor: '#FCD34D',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FBBF24',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
    transform: [{ scale: 1 }],
  },
  reportText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});