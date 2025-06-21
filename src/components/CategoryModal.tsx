import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type CategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (category: { name: string; addons: string[] }) => void;
  category?: { name: string; addons: string[] };
};

export default function CategoryModal({
  visible,
  onClose,
  onSave,
  category,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [addons, setAddons] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setAddons(category.addons.join(', '));
    } else {
      setName('');
      setAddons('');
    }
  }, [category]);

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{category ? 'Edit' : 'Add'} Category</Text>

          <TextInput
            placeholder="Category Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
            Example: Cheese, Bacon, Egg
          </Text>
          <TextInput
            placeholder="Add-ons (comma-separated)"
            value={addons}
            onChangeText={setAddons}
            style={styles.input}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancel]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onSave({ name, addons: addons.split(',').map((a) => a.trim()) })
              }
              style={[styles.button, styles.save]}>
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
    backgroundColor: 'rgba(0,0,0,0.4)', // Slightly darker
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFBEB', // EggShell cream
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
    color: '#D97706', // Deep yellow-orange
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
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
  cancel: {
    backgroundColor: '#E5E7EB', // Light gray
  },
  save: {
    backgroundColor: '#F59E0B', // Vibrant egg yellow
    marginLeft: 10,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1F2937',
  },
});
