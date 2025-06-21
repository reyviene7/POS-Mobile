// components/CategoryModal.tsx
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancel: {
    backgroundColor: '#9CA3AF',
  },
  save: {
    backgroundColor: '#6366F1',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
