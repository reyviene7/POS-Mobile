import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import ExpensesModal from '../src/components/ExpensesModal';

type Expense = {
  id: string;
  type: string;
  amount: number;
  remarks: string;
  timestamp: string;
};

export default function Expenses() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      type: 'Electrical Bill',
      amount: 3000,
      remarks: 'Monthly Meralco payment',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'Water Bill',
      amount: 1200,
      remarks: 'Manila Water monthly',
      timestamp: new Date().toISOString(),
    },
  ]);

  const openAddModal = () => {
    setSelectedExpense(null);
    setModalVisible(true);
  };

  const openEditModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setModalVisible(true);
  };

  const handleSave = (data: Expense) => {
    if (data.id) {
      // Update existing
      setExpenses((prev) =>
        prev.map((e) => (e.id === data.id ? { ...data } : e))
      );
    } else {
      // Add new
      setExpenses((prev) => [
        ...prev,
        { ...data, id: uuidv4(), timestamp: new Date().toISOString() },
      ]);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setExpenses((prev) => prev.filter((exp) => exp.id !== id));
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEditModal(item)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.remarks}>{item.remarks}</Text>
        <Text style={styles.datetime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <View style={styles.side}>
        <Text style={styles.amount}>₱{item.amount.toFixed(2)}</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💸 Expenses</Text>
      <Text style={styles.subtitle}>Track and manage shop expenses</Text>

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Add New Expense</Text>
      </TouchableOpacity>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses recorded yet.</Text>
        }
      />

      <ExpensesModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        expense={selectedExpense}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFCE8',
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
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#FBBF24',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    elevation: 2,
  },
  type: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  remarks: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  datetime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  side: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  deleteBtn: {
    marginTop: 4,
    padding: 4,
  },
  deleteText: {
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9CA3AF',
  },
});