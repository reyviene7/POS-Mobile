import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../../api';

type CreditRecord = {
  creditId?: number;
  orderId: string;
  customerName: string;
  amount: number;
  paid: number;
  dueDate: string;
  timestamp: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  credit: CreditRecord | null;
  onSave: (record: Omit<CreditRecord, 'creditId'>) => void;
};

export default function CreditModal({ visible, onClose, credit, onSave }: Props) {
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [paid, setPaid] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [loadingOrderIds, setLoadingOrderIds] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Credit prop received:', credit);
    if (credit) {
      setOrderId(credit.orderId);
      setCustomerName(credit.customerName);
      setAmount(credit.amount.toString());
      setPaid(credit.paid.toString());
      setDueDate(new Date(credit.dueDate));
    } else {
      setOrderId('');
      setCustomerName('');
      setAmount('');
      setPaid('');
      setDueDate(new Date());
    }
    fetchOrderIds();
  }, [credit]);

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
      Toast.show({
        type: 'error',
        text1: '⚠️ Error',
        text2: 'Failed to load order IDs.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoadingOrderIds(false);
    }
  };

  const handleSubmit = () => {
    if (!orderId.trim()) {
      Toast.show({
        type: 'error',
        text1: '📋 Missing Order ID',
        text2: 'Order ID is required.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    if (!customerName.trim()) {
      Toast.show({
        type: 'error',
        text1: '👤 Missing Customer Name',
        text2: 'Customer name is required.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: '💵 Invalid Amount',
        text2: 'Valid amount is required.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    const paidValue = parseFloat(paid || '0');
    if (isNaN(paidValue) || paidValue < 0) {
      Toast.show({
        type: 'error',
        text1: '💵 Invalid Paid Amount',
        text2: 'Valid paid amount is required.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    if (paidValue > parseFloat(amount)) {
      Toast.show({
        type: 'error',
        text1: '⚖️ Invalid Paid Amount',
        text2: 'Paid amount cannot exceed total amount.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }

    const creditData: Omit<CreditRecord, 'creditId'> = {
      orderId: orderId.trim(),
      customerName: customerName.trim(),
      amount: parseFloat(amount),
      paid: paidValue,
      dueDate: dueDate.toISOString(),
      timestamp: new Date().toISOString(),
    };

    console.log('Saving credit:', creditData);
    onSave(creditData);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{credit ? 'Edit Credit' : 'Add Credit'}</Text>
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
            placeholder="Customer Name"
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
          />
          <TextInput
            placeholder="Amount"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Paid amount (optional)"
            style={styles.input}
            value={paid}
            onChangeText={setPaid}
            keyboardType="numeric"
          />
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateText}>
              📅 Due: {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={dueDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(e, selected) => {
                if (selected) setDueDate(selected);
                setShowPicker(false);
              }}
            />
          )}
          <View style={styles.buttonContainer}>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFDEB',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 10,
    marginBottom: 4,
  },
  dateButton: {
    backgroundColor: '#FFD580',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F4A000',
  },
  dateText: {
    color: '#78350F',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
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
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1F2937',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
});