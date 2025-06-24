import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type PaymentMethod = {
  id?: string;
  name: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  payment: PaymentMethod | null;
  onSave: (method: PaymentMethod) => void;
};

export default function PaymentModal({ visible, onClose, payment, onSave }: Props) {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(payment?.name || '');
  }, [payment]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Oops!', 'Payment method name is required.');
      return;
    }

    onSave({
      id: payment?.id,
      name: name.trim(),
    });
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.header}>
            {payment ? 'Edit Payment Method' : 'New Payment Method'}
          </Text>

          <TextInput
            placeholder="e.g. Cash, GCash, Maya"
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
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D97706',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FBBF24',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancel: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 10,
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  save: {
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  saveText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
