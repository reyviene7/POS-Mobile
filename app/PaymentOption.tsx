import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function PaymentOptionScreen() {
  const router = useRouter();
  const { total } = useLocalSearchParams(); // from previous screen

  const amount = parseFloat(total as string || '0');

  const handleSelectPayment = (method: string) => {
    router.push({
      pathname: '/AmountReceived',
      query: { total: amount.toFixed(2), method },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>AMOUNT PAYABLE</Text>
      <Text style={styles.amount}>₱{amount.toFixed(2)}</Text>

      <Text style={styles.subLabel}>Choose payment option</Text>

      <TouchableOpacity style={styles.option} onPress={() => handleSelectPayment('Cash')}>
        <Text style={styles.optionText}>💵 Cash</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => handleSelectPayment('Credit')}>
        <Text style={styles.optionText}>💳 Credit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => handleSelectPayment('Gcash')}>
        <Text style={styles.optionText}>📱 GCash</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#FFF7ED' },
  label: { textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#B45309' },
  amount: { textAlign: 'center', fontSize: 36, fontWeight: '800', color: '#DC2626', marginBottom: 24 },
  subLabel: { textAlign: 'center', fontSize: 16, fontWeight: '500', marginBottom: 12 },
  option: { backgroundColor: '#FACC15', padding: 16, marginVertical: 8, borderRadius: 10, alignItems: 'center' },
  optionText: { fontSize: 18, fontWeight: '700', color: '#78350F' },
});
