import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PaymentCompleteScreen() {
  const router = useRouter();
  const { total, received, change, method } = useLocalSearchParams();

  const handleNewEntry = () => {
    router.replace('/PointOfSales'); // or wherever your sales start screen is
  };

  const handleOpenDrawer = () => {
    // Navigate to cash drawer screen
    alert('Cash drawer opened (simulated)');
  };

  const handlePrintReceipt = () => {
    router.push('/ReceiptPrint');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.completeText}>COMPLETED</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>PAYABLE</Text>
        <Text style={styles.amount}>₱{total}</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>AMOUNT RECEIVED</Text>
        <Text style={styles.amount}>₱{received}</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>CHANGE</Text>
        <Text style={[styles.amount, { color: '#10B981' }]}>₱{change}</Text>
      </View>

      <Text style={styles.methodText}>Payment Method: {method}</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.drawer]} onPress={handleOpenDrawer}>
          <Text style={styles.buttonText}>OPEN CASH DRAWER</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.print]} onPress={handlePrintReceipt}>
          <Text style={styles.buttonText}>RECEIPT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.new]} onPress={handleNewEntry}>
          <Text style={styles.buttonText}>NEW ENTRY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#16A34A',
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
  },
  methodText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  drawer: {
    backgroundColor: '#F59E0B',
  },
  print: {
    backgroundColor: '#3B82F6',
  },
  new: {
    backgroundColor: '#4F46E5',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});
