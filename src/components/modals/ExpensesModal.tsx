import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

type Expense = {
  expenseId?: number;
  type: string;
  amount: number;
  remarks: string;
  timestamp: string;
  userId: number;
};

type ExpensesModalProps = {
  visible: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSave: (data: Omit<Expense, 'expenseId'>) => void;
};

export default function ExpensesModal({ visible, onClose, expense, onSave }: ExpensesModalProps) {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [userId] = useState(1); // Default userId (adjust for auth)

  useEffect(() => {
    if (expense) {
      setType(expense.type || '');
      setAmount(expense.amount != null ? expense.amount.toString() : '');
      setRemarks(expense.remarks || '');
    } else {
      setType('');
      setAmount('');
      setRemarks('');
    }
  }, [expense]);

  const handleSave = () => {
    if (!type.trim()) {
      Toast.show({
        type: 'error',
        text1: '📋 Missing Expense Type',
        text2: 'Expense type is required.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
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

    const expenseData: Omit<Expense, 'expenseId'> = {
      type: type.trim(),
      amount: parseFloat(amount),
      remarks: remarks.trim(),
      timestamp: new Date().toISOString(),
      userId,
    };

    console.log('Saving expense:', expenseData);
    onSave(expenseData);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{expense ? 'Edit Expense' : 'Add Expense'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Expense Type (e.g., Electrical Bill)"
            value={type}
            onChangeText={setType}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Remarks (optional)"
            value={remarks}
            onChangeText={setRemarks}
            multiline
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
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
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FEFCE8',
    borderRadius: 20,
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
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#FBBF24',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1F2937',
  },
});