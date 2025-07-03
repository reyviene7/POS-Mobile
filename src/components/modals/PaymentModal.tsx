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

type PaymentMethod = {
  paymentMethodId?: number;
  name: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  payment: PaymentMethod | null;
  onSave: (method: { name: string }) => void;
};

export default function PaymentModal({ visible, onClose, payment, onSave }: Props) {
  const [name, setName] = useState('');

  useEffect(() => {
    console.log('Payment prop received:', payment);
    setName(payment?.name || '');
  }, [payment]);

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: '📋 Missing Payment Method',
        text2: 'Payment method name is required.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }

    onSave({ name: name.trim() });
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.header}>
            {payment ? 'Edit Payment Method' : 'New Payment Method'}
          </Text>
          <TextInput
            placeholder="e.g., Cash, GCash, Maya"
            placeholderTextColor="#4B5563"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.save} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
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
    backgroundColor: '#FFFDEB',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancel: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginRight: 10,
  },
  cancelText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 16,
  },
  save: {
    backgroundColor: '#FCD34D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  saveText: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 16,
  },
});