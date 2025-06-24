import DateTimePicker from '@react-native-community/datetimepicker';
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

type CreditRecord = {
  id?: string;
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
  onSave: (record: CreditRecord) => void;
};

export default function CreditModal({ visible, onClose, credit, onSave }: Props) {
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [paid, setPaid] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
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
  }, [credit]);

  const handleSubmit = () => {
    if (!orderId || !customerName || !amount) {
      Alert.alert('Missing Info', 'Please fill out all required fields.');
      return;
    }

    onSave({
      id: credit?.id || undefined,
      orderId,
      customerName,
      amount: parseFloat(amount),
      paid: parseFloat(paid || '0'),
      dueDate: dueDate.toISOString(),
      timestamp: credit?.timestamp || new Date().toISOString(),
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{credit ? 'Edit Credit' : 'Add Credit'}</Text>

          <TextInput
            placeholder="Order ID"
            style={styles.input}
            value={orderId}
            onChangeText={setOrderId}
          />
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
            placeholder="Paid (optional)"
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

          <View style={styles.buttonRow}>
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 14,
  },
  dateButton: {
    backgroundColor: '#FDE68A',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderColor: '#FBBF24',
    borderWidth: 1,
    marginBottom: 16,
  },
  dateText: {
    color: '#78350F',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  cancel: {
    backgroundColor: '#E5E7EB',
  },
  save: {
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});