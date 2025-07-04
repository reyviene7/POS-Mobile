import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string) => void;
}

const DateRangeModal: React.FC<Props> = ({ visible, onClose, onConfirm }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.modalIcon}>
            <Text style={styles.modalEmoji}>🥖</Text>
          </View>
          <Text style={styles.modalTitle}>Pick Your Sandwich Dates!</Text>
          <Text style={styles.label}>🧀 Start Date (YYYY-MM-DD):</Text>
          <TextInput
            placeholder="2025-01-01"
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholderTextColor="#713F12"
          />
          <Text style={styles.label}>🧀 End Date (YYYY-MM-DD):</Text>
          <TextInput
            placeholder="2025-01-31"
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholderTextColor="#713F12"
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>No, Keep It!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(startDate, endDate)}
              style={styles.confirm}
            >
              <Text style={styles.confirmText}>Yes, Toast It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateRangeModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'rgba(254, 243, 199, 0.95)', // Buttery yellow
    padding: 24,
    borderRadius: 24,
    borderTopLeftRadius: 12, // Bitten sandwich corner
    borderBottomRightRadius: 12,
    width: '85%',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#F59E0B', // Toasty crust
    shadowColor: '#431407',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FCD34D', // Cheesy yellow
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    marginBottom: 12,
  },
  modalEmoji: {
    fontSize: 36,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#431407', // Toasted brown
    fontFamily: 'Comic Sans MS',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    fontSize: 16,
    color: '#431407',
    fontFamily: 'Comic Sans MS',
    marginBottom: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#F59E0B', // Toasty crust
    backgroundColor: '#FFF7ED', // Light bread color
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#431407',
    fontFamily: 'Comic Sans MS',
    width: '100%',
    shadowColor: '#431407',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  cancel: {
    flex: 1,
    backgroundColor: '#FCD34D', // Cheesy yellow
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#431407',
    fontFamily: 'Comic Sans MS',
  },
  confirm: {
    flex: 1,
    backgroundColor: '#F43F5E', // Red for confirm
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1.5,
    borderColor: '#431407',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Comic Sans MS',
  },
});