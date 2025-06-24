import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PaymentModal from '../src/components/PaymentModal';

type PaymentMethod = {
  id: string;
  name: string;
};

export default function Payment() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'Cash' },
    { id: '2', name: 'Credit' },
    { id: '3', name: 'GCash' },
    { id: '4', name: 'Maya' },
    { id: '5', name: 'Other E-Payment' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<PaymentMethod | null>(null);

  const handleAdd = () => {
    setSelected(null);
    setModalVisible(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setSelected(method);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Method', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
        },
      },
    ]);
  };

  const handleSave = (method: PaymentMethod) => {
    if (method.id) {
      setPaymentMethods((prev) =>
        prev.map((m) => (m.id === method.id ? method : m))
      );
    } else {
      const newMethod = { ...method, id: Date.now().toString() };
      setPaymentMethods((prev) => [newMethod, ...prev]);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍳 Payment Options</Text>
      <Text style={styles.subtitle}>Keep track of how your customers pay</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>+ Add New Payment Method</Text>
      </TouchableOpacity>

      <FlatList
        data={paymentMethods}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleEdit(item)}>
            <Text style={styles.method}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.delete}>🗑</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
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
    backgroundColor: '#FFFBEB',
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
});
