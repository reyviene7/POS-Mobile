import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Expense = {
  id?: number;
  type?: string;
  amount?: number;
  remarks?: string;
  timestamp?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSave: (expenseData: Expense) => void;
};

export default function ExpensesModal({ visible, onClose, expense, onSave }: Props) {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setType(expense.type || '');
      setAmount(expense.amount?.toString() || '');
      setRemarks(expense.remarks || '');
      setTimestamp(expense.timestamp || new Date().toISOString());
    } else {
      resetForm();
    }
  }, [expense]);

  const resetForm = () => {
    setType('');
    setAmount('');
    setRemarks('');
    setTimestamp(new Date().toISOString());
  };

  const handleSubmit = async () => {
    if (!type.trim() || !amount.trim()) {
      Alert.alert('Missing Fields', 'Expense type and amount are required.');
      return;
    }

    if (isNaN(+amount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
      return;
    }

    setLoading(true);

    try {
      const expenseData: Expense = {
        id: expense?.id,
        type: type.trim(),
        amount: parseFloat(amount),
        remarks: remarks.trim(),
        timestamp: timestamp || new Date().toISOString(),
      };

      // Simulate save delay
      setTimeout(() => {
        onSave(expenseData);
        onClose();
        setLoading(false);
      }, 500);
    } catch (err) {
      Alert.alert('Error', 'Failed to save expense.');
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#F59E0B" />
            </View>
          )}

          <Text style={styles.title}>{expense ? 'Edit Expense' : 'Add Expense'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Expense Type (e.g. Electrical Bill)"
            value={type}
            onChangeText={setType}
          />

          <TextInput
            style={styles.input}
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            placeholder="Remarks (optional)"
            value={remarks}
            onChangeText={setRemarks}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit}>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#D97706',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#FBBF24',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    fontWeight: '600',
    color: '#1F2937',
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
});