import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DeleteModalProps {
  visible: boolean;
  itemType: string; 
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ visible, itemType, onConfirm, onCancel }) => (
  <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onCancel}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalIcon}>
          <Text style={styles.modalEmoji}>🥖</Text>
        </View>
        <Text style={styles.modalTitle}>Confirm Delete!</Text>
        <Text style={styles.modalMessage}>
          Sure you want to toss this {itemType} out of the sandwich stack?
        </Text>
        <View style={styles.modalButtonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>No, Keep It!</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={onConfirm}>
            <Text style={styles.deleteButtonText}>Yes, Toss It!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'rgba(254, 243, 199, 0.95)', // Buttery yellow
    borderRadius: 24,
    borderTopLeftRadius: 12, // Bitten sandwich corner
    borderBottomRightRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#431407',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FCD34D',
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
    color: '#333',
    fontFamily: 'Comic Sans MS',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalMessage: {
    fontSize: 16,
    color: '#713F12',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FCD34D',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#431407',
    fontFamily: 'Comic Sans MS',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#431407',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Comic Sans MS',
  },
});

export default DeleteModal;