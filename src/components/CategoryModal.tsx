import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../api';

type CategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (category: { name: string; addonIds: number[] }) => void;
  category?: { id?: number; name: string; addons: string[] };
};

type Addon = {
  id: number;
  name: string;
};

export default function CategoryModal({
  visible,
  onClose,
  onSave,
  category,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [newAddonName, setNewAddonName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAddons = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/addons');
        const fetchedAddons: Addon[] = response.data.map((addon: any) => ({
          id: addon.addonId,
          name: addon.addonName,
        }));
        console.log('Fetched addons:', fetchedAddons);
        setAddons(fetchedAddons);
      } catch (err: any) {
        console.error('Error fetching addons:', err.message, err.response?.data);
        setError('Failed to load add-ons. Please try again.');
        Alert.alert('Error', 'Failed to load add-ons. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAddons();

    if (category) {
      setName(category.name);
      setSelectedAddonIds([]);
    } else {
      setName('');
      setSelectedAddonIds([]);
      setNewAddonName('');
    }
  }, [category]);

  useEffect(() => {
    if (category && addons.length > 0) {
      const selectedIds = addons
        .filter((addon) => category.addons.includes(addon.name))
        .map((addon) => addon.id);
      setSelectedAddonIds(selectedIds);
    }
  }, [category, addons]);

  const toggleAddon = (id: number) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((addonId) => addonId !== id) : [...prev, id]
    );
  };

  const handleAddNewAddon = async () => {
    if (!newAddonName.trim()) {
      Alert.alert('Error', 'Add-on name is required.');
      return;
    }

    if (addons.some((addon) => addon.name.toLowerCase() === newAddonName.trim().toLowerCase())) {
      Alert.alert('Error', 'Add-on name already exists.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/addons', { addonName: newAddonName.trim() });
      const newAddon: Addon = {
        id: response.data.addonId,
        name: response.data.addonName,
      };
      console.log('Created new addon:', newAddon);

      setAddons((prev) => [...prev, newAddon]);
      setSelectedAddonIds((prev) => [...prev, newAddon.id]);
      setNewAddonName('');
      Alert.alert('Success', `Add-on "${newAddon.name}" created successfully!`);
    } catch (err: any) {
      console.error('Error creating add-on:', err.message, err.response?.data);
      Alert.alert('Error', 'Failed to create add-on. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Category name is required.');
      return;
    }
    onSave({ name: name.trim(), addonIds: selectedAddonIds });
  };

  const renderAddonItem = ({ item }: { item: Addon }) => (
    <TouchableOpacity
      style={styles.addonItem}
      onPress={() => toggleAddon(item.id)}
    >
      <Text style={styles.addonText}>{item.name}</Text>
      <Text style={styles.checkbox}>
        {selectedAddonIds.includes(item.id) ? '☑' : '☐'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#F59E0B" />
            </View>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Text style={styles.title}>{category ? 'Edit' : 'Add'} Category</Text>
          <TextInput
            placeholder="Category Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <Text style={styles.addonLabel}>Select Add-ons:</Text>
          <FlatList
            data={addons}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderAddonItem}
            style={styles.addonList}
          />
          <Text style={styles.addonLabel}>Add New Add-on:</Text>
          <View style={styles.newAddonContainer}>
            <TextInput
              placeholder="New Add-on Name"
              value={newAddonName}
              onChangeText={setNewAddonName}
              style={[styles.input, styles.newAddonInput]}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddNewAddon}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancel]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.save]}>
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
    backgroundColor: '#FFFBEB',
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
  addonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  addonList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  addonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 4,
  },
  addonText: {
    fontSize: 14,
    color: '#1F2937',
  },
  checkbox: {
    fontSize: 18,
  },
  newAddonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  newAddonInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
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
    backgroundColor: '#E5E7EB',
  },
  save: {
    backgroundColor: '#F59E0B',
    marginLeft: 10,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1F2937',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
});