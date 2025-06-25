import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../api';
import PaymentModal from '../src/components/PaymentModal';

type PaymentMethod = {
  paymentMethodId: number;
  name: string;
};

export default function Payment() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/payment-methods');
      const fetchedMethods: PaymentMethod[] = response.data.map((method: any) => ({
        paymentMethodId: method.paymentMethodId,
        name: method.name,
      }));
      console.log('Fetched payment methods:', fetchedMethods);
      setPaymentMethods(fetchedMethods);
    } catch (err: any) {
      console.error('Error fetching payment methods:', err.message, err.response?.data);
      setError('Failed to load payment methods. Please try again.');
      Alert.alert('Error', 'Failed to load payment methods.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelected(null);
    setModalVisible(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    console.log('Editing payment method:', method);
    setSelected(method);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Method', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.delete(`/payment-methods/${id}`);
            console.log('Deleted payment method:', id);
            Alert.alert('Success', 'Payment method deleted successfully!');
            fetchPaymentMethods();
          } catch (err: any) {
            console.error('Error deleting payment method:', err.message, err.response?.data);
            Alert.alert('Error', 'Failed to delete payment method.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSave = async (method: { name: string }) => {
    setLoading(true);
    try {
      if (selected) {
        // Update existing
        const response = await api.put(`/payment-methods/${selected.paymentMethodId}`, { name: method.name });
        console.log('Updated payment method:', response.data);
        Alert.alert('Success', 'Payment method updated successfully!');
      } else {
        // Add new
        const response = await api.post('/payment-methods', { name: method.name });
        console.log('Created payment method:', response.data);
        Alert.alert('Success', 'Payment method created successfully!');
      }
      fetchPaymentMethods();
      setModalVisible(false);
    } catch (err: any) {
      console.error('Error saving payment method:', err.message, err.response?.data);
      Alert.alert('Error', 'Failed to save payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: PaymentMethod }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleEdit(item)}>
      <Text style={styles.method}>{item.name}</Text>
      <TouchableOpacity onPress={() => handleDelete(item.paymentMethodId)}>
        <Text style={styles.delete}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FCD34D" />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.title}>🍳 Payment Options</Text>
      <Text style={styles.subtitle}>Keep track of how your customers pay</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>+ Add New Payment Method</Text>
      </TouchableOpacity>
      <FlatList
        data={paymentMethods}
        keyExtractor={(item) => item.paymentMethodId.toString()}
        contentContainerStyle={{ paddingTop: 16 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No payment methods yet 🐣</Text>
        }
      />
      <PaymentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        payment={selected}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDEB',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D97706',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#FCD34D',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  addButtonText: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  method: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },
  delete: {
    fontSize: 18,
    color: '#EF4444',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 32,
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
    fontSize: 16,
  },
});