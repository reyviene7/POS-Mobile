import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AmountReceivedScreen() {
  const router = useRouter();
  const { total, method } = useLocalSearchParams();
  const payable = parseFloat(total as string || '0');

  const [received, setReceived] = useState('');
  const [change, setChange] = useState(0);

  const suggestedBills = [10, 20, 50, 100, 200, 300, 400, 500, 1000];

  const handleBillPress = (amount: number) => {
    const current = parseFloat(received || '0');
    const newAmount = current + amount;
    setReceived(newAmount.toFixed(2));
    setChange(newAmount - payable);
  };

  const handleInputChange = (value: string) => {
    setReceived(value);
    const num = parseFloat(value || '0');
    setChange(num - payable);
  };

  const handleExactAmount = () => {
    setReceived(payable.toFixed(2));
    setChange(0);
  };

  const handleProceed = () => {
    router.push({
      pathname: '/PaymentComplete',
      query: {
        total: payable.toFixed(2),
        received: parseFloat(received || '0').toFixed(2),
        method: method as string,
        change: change.toFixed(2),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.centered}>
          <Text style={styles.label}>AMOUNT PAYABLE</Text>
          <Text style={styles.amount}>₱{payable.toFixed(2)}</Text>
        </View>

        <View style={styles.centered}>
          <Text style={styles.subLabel}>Amount Received</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount received"
            keyboardType="numeric"
            value={received}
            onChangeText={handleInputChange}
          />
        </View>

        <View style={styles.centered}>
          <Text style={styles.suggestion}>Type or select bill tendered</Text>
        </View>

        <View style={styles.billsContainer}>
          {suggestedBills.map((bill) => (
            <TouchableOpacity key={bill} style={styles.billButton} onPress={() => handleBillPress(bill)}>
              <Text style={styles.billText}>₱{bill}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.exactButton} onPress={handleExactAmount}>
          <Text style={styles.exactButtonText}>EXACT AMOUNT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
          <Text style={styles.proceedText}>PROCEED</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    padding: 20,
  },
  centered: {
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#B45309',
  },
  amount: {
    fontSize: 38,
    fontWeight: '800',
    color: '#DC2626',
  },
  subLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    width: '80%',
    elevation: 2,
  },
  suggestion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  billsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  billButton: {
    backgroundColor: '#FACC15',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  billText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#78350F',
  },
  exactButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  exactButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  proceedButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  proceedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
