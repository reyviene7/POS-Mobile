import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CreditModal from '../src/components/CreditModal';

type CreditRecord = {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  paid: number;
  dueDate: string;
  timestamp: string;
};

export default function Credit() {
  const [credits, setCredits] = useState<CreditRecord[]>([
    {
      id: '1',
      orderId: 'SALE004',
      customerName: 'Rey Pasiculan',
      amount: 636,
      paid: 200,
      dueDate: '2025-06-28T19:05:00',
      timestamp: '2025-06-21T19:05:00',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CreditRecord | null>(null);

  const handleAdd = () => {
    setSelectedCredit(null);
    setModalVisible(true);
  };

  const handleEdit = (record: CreditRecord) => {
    setSelectedCredit(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Credit', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setCredits((prev) => prev.filter((c) => c.id !== id));
        },
      },
    ]);
  };

  const handleSave = (credit: CreditRecord) => {
    if (credit.id) {
      setCredits((prev) =>
        prev.map((c) => (c.id === credit.id ? credit : c))
      );
    } else {
      const newCredit = {
        ...credit,
        id: Date.now().toString(),
      };
      setCredits((prev) => [newCredit, ...prev]);
    }
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: CreditRecord }) => {
    const balance = item.amount - item.paid;
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleEdit(item)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>🧾 {item.orderId}</Text>
          <Text style={styles.customer}>👤 {item.customerName}</Text>
          <Text style={styles.timestamp}>🕒 {new Date(item.timestamp).toLocaleString()}</Text>
          <Text style={styles.due}>📅 Due: {new Date(item.dueDate).toLocaleString()}</Text>
          <Text style={styles.balance}>
            Total: ₱{item.amount.toFixed(2)} | Paid: ₱{item.paid.toFixed(2)} | <Text style={styles.unpaid}>Unpaid: ₱{balance.toFixed(2)}</Text>
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏦 Credit</Text>
      <Text style={styles.subtitle}>Track customer utang and partial payments</Text>

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>+ Add Credit Record</Text>
      </TouchableOpacity>

      <FlatList
        data={credits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No credit records found.</Text>
        }
      />

      <CreditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        credit={selectedCredit}
        onSave={handleSave}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#78350F',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  customer: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  due: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
    marginBottom: 2,
  },
  balance: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  unpaid: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9CA3AF',
  },
});