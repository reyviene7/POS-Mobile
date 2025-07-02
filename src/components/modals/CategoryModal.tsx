import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../../api';

type CategoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (category: { name: string; addonIds: number[] }) => void;
  category?: { id?: number; name: string; addons: string[] };
};

type Addon = {
  id: number;
  name: string;
  price: number;
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
  const [newAddonPrice, setNewAddonPrice] = useState('');
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
          price: parseFloat(addon.price) || 0, // Convert BigDecimal to number, fallback to 0
        }));
        console.log('Fetched addons:', fetchedAddons);
        setAddons(fetchedAddons);
      } catch (err: any) {
        console.error('Error fetching addons:', err.message, err.response?.data);
        setError('Failed to load add-ons. Please try again.');
        Toast.show({
          type: 'error',
          text1: '⚠️ Error',
          text2: 'Failed to load add-ons. Please try again.',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
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
      setNewAddonPrice('');
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
      Toast.show({
        type: 'error',
        text1: '📋 Missing Add-on Name',
        text2: 'Add-on name is required.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }

    if (addons.some((addon) => addon.name.toLowerCase() === newAddonName.trim().toLowerCase())) {
      Toast.show({
        type: 'error',
        text1: '📋 Duplicate Add-on',
        text2: 'Add-on name already exists.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }

    const price = parseFloat(newAddonPrice);
    if (!newAddonPrice.trim() || isNaN(price) || price < 0) {
      Toast.show({
        type: 'error',
        text1: '💵 Invalid Add-on Price',
        text2: 'Please provide a valid non-negative price.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/addons', {
        addonName: newAddonName.trim(),
        price,
      });
      const newAddon: Addon = {
        id: response.data.addonId,
        name: response.data.addonName,
        price: parseFloat(response.data.price) || 0,
      };
      console.log('Created new addon:', newAddon);

      setAddons((prev) => [...prev, newAddon]);
      setSelectedAddonIds((prev) => [...prev, newAddon.id]);
      setNewAddonName('');
      setNewAddonPrice('');
      Toast.show({
        type: 'success',
        text1: '✅ Add-on Created',
        text2: `Add-on "${newAddon.name}" created successfully!`,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } catch (err: any) {
      console.error('Error creating add-on:', err.message, err.response?.data);
      Toast.show({
        type: 'error',
        text1: '⚠️ Error',
        text2: 'Failed to create add-on. Please try again.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: '📋 Missing Category Name',
        text2: 'Category name is required.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    onSave({ name: name.trim(), addonIds: selectedAddonIds });
  };

  const renderAddonItem = ({ item }: { item: Addon }) => (
    <TouchableOpacity
      style={styles.addonItem}
      onPress={() => toggleAddon(item.id)}
    >
      <View style={styles.addonDetails}>
        <Text style={styles.addonText}>{item.name}</Text>
        <Text style={styles.addonPrice}>₱{item.price.toFixed(2)}</Text>
      </View>
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
            <TextInput
              placeholder="Price (₱)"
              value={newAddonPrice}
              onChangeText={setNewAddonPrice}
              style={[styles.input, styles.newAddonPriceInput]}
              keyboardType="numeric"
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
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 4,
  },
  addonDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addonText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  addonPrice: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
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
    flex: 2,
    marginRight: 8,
  },
  newAddonPriceInput: {
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