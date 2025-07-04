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

type StockItem = { id?: string; name: string; quantity: number; unit: string };
type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (item: StockItem) => void;
  item: StockItem | null;
};

export default function StockManagerModal({ visible, onClose, onSave, item }: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity.toString());
      setUnit(item.unit);
    } else {
      setName('');
      setQuantity('');
      setUnit('pcs');
    }
  }, [item, visible]);

  const handleSubmit = () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: '📋 Missing Ingredient Name',
        text2: 'Ingredient name is required.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    const qty = Number(quantity);
    if (!quantity.trim() || isNaN(qty) || qty < 0) {
      Toast.show({
        type: 'error',
        text1: '🔢 Invalid Quantity',
        text2: 'Please provide a valid non-negative quantity.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    if (!unit.trim()) {
      Toast.show({
        type: 'error',
        text1: '📏 Missing Unit',
        text2: 'Unit is required.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    onSave({ id: item?.id, name: name.trim(), quantity: qty, unit: unit.trim() });
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{item ? 'Edit Ingredient' : 'Add Ingredient'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingredient Name"
            placeholderTextColor="#4B5563"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            placeholderTextColor="#4B5563"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <TextInput
            style={styles.input}
            placeholder="Unit (pcs, kg, etc.)"
            placeholderTextColor="#4B5563"
            value={unit}
            onChangeText={setUnit}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.buttons, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttons, styles.saveButton]} onPress={handleSubmit}>
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
  buttons: {
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