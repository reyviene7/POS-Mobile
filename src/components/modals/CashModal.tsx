import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../../api';

type CashTransaction = {
  id: string;
  orderId: string;
  amount: number;
  timestamp: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  transaction: CashTransaction | null;
  onSave: (transaction: Omit<CashTransaction, 'id'>) => void;
  onDelete: () => void;
};

export default function CashModal({ visible, onClose, transaction, onSave, onDelete }: Props) {
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [timestamp, setTimestamp] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [loadingOrderIds, setLoadingOrderIds] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setOrderId(transaction.orderId);
      setAmount(transaction.amount.toString());
      setTimestamp(new Date(transaction.timestamp));
    } else {
      setOrderId('');
      setAmount('');
      setTimestamp(new Date());
    }
    fetchOrderIds();
  }, [transaction]);

  const fetchOrderIds = async () => {
    setLoadingOrderIds(true);
    setError(null);
    try {
      const response = await api.get('/sales-history/order-ids');
      console.log('Fetched order IDs:', response.data);
      setOrderIds(response.data);
    } catch (err: any) {
      console.error('Error fetching order IDs:', err.message, err.response?.data);
      setError('Failed to load order IDs. Please try again.');
      Alert.alert('Error', 'Failed to load order IDs.');
    } finally {
      setLoadingOrderIds(false);
    }
  };

  const handleSubmit = () => {
    if (!orderId.trim()) {
      Alert.alert('Error', 'Order ID is required.');
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Valid amount is required.');
      return;
    }

    const transactionData: Omit<CashTransaction, 'id'> = {
      orderId: orderId.trim(),
      amount: parseFloat(amount),
      timestamp: timestamp.toISOString(),
    };

    console.log('Saving transaction:', transactionData);
    onSave(transactionData);
  };

  if (!visible || !transaction) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>💵 Edit Cash Transaction</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {loadingOrderIds ? (
            <Text>Loading order IDs...</Text>
          ) : (
            <Picker
              selectedValue={orderId}
              onValueChange={(value) => setOrderId(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Order ID" value="" />
              {orderIds.map((id) => (
                <Picker.Item key={id} label={id} value={id} />
              ))}
            </Picker>
          )}
          <TextInput
            placeholder="Amount"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateText}>
              🕒 Timestamp: {timestamp.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={timestamp}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(e, selected) => {
                if (selected) setTimestamp(selected);
                setShowPicker(false);
              }}
            />
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.delete]} onPress={onDelete}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.save]} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#10B981',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 10,
    marginBottom: 4,
  },
  dateButton: {
    backgroundColor: '#A7F3D0',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  dateText: {
    color: '#065F46',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancel: {
    backgroundColor: '#E5E7EB',
  },
  save: {
    backgroundColor: '#10B981',
  },
  delete: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
});