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
import ExpensesModal from '../src/components/ExpensesModal';

type Expense = {
  expenseId: number;
  type: string;
  amount: number;
  remarks: string;
  timestamp: string;
  userId: number;
};

export default function Expenses() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/expenses');
      const fetchedExpenses: Expense[] = response.data.map((exp: any) => ({
        expenseId: exp.expenseId,
        type: exp.type,
        amount: parseFloat(exp.amount), // Convert BigDecimal to number
        remarks: exp.remarks || '',
        timestamp: exp.timestamp,
        userId: exp.user?.userId || 1, // Default userId if missing
      }));
      console.log('Fetched expenses:', fetchedExpenses);
      setExpenses(fetchedExpenses);
    } catch (err: any) {
      console.error('Error fetching expenses:', err.message, err.response?.data);
      setError('Failed to load expenses. Please try again.');
      Alert.alert('Error', 'Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedExpense(null);
    setModalVisible(true);
  };

  const openEditModal = (expense: Expense) => {
    console.log('Editing expense:', expense);
    setSelectedExpense(expense);
    setModalVisible(true);
  };

  const handleSave = async (data: Omit<Expense, 'expenseId'>) => {
    setLoading(true);
    try {
      const payload = {
        type: data.type,
        amount: data.amount,
        remarks: data.remarks,
        timestamp: data.timestamp || new Date().toISOString(),
        userId: data.userId || 1, // Default userId
      };
      if (selectedExpense) {
        // Update existing
        const response = await api.put(`/expenses/${selectedExpense.expenseId}`, payload);
        console.log('Updated expense:', response.data);
        Alert.alert('Success', 'Expense updated successfully!');
      } else {
        // Add new
        const response = await api.post('/expenses', payload);
        console.log('Created expense:', response.data);
        Alert.alert('Success', 'Expense created successfully!');
      }
      fetchExpenses();
      setModalVisible(false);
    } catch (err: any) {
      console.error('Error saving expense:', err.message, err.response?.data);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.delete(`/expenses/${id}`);
            console.log('Deleted expense:', id);
            Alert.alert('Success', 'Expense deleted successfully!');
            fetchExpenses();
          } catch (err: any) {
            console.error('Error deleting expense:', err.message, err.response?.data);
            Alert.alert('Error', 'Failed to delete expense.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEditModal(item)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.remarks}>{item.remarks || 'No remarks'}</Text>
        <Text style={styles.datetime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <View style={styles.side}>
        <Text style={styles.amount}>₱{item.amount.toFixed(2)}</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.expenseId)}>
          <Text style={styles.deleteText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FBBF24" />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.title}>💸 Expenses</Text>
      <Text style={styles.subtitle}>Track and manage shop expenses</Text>
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>+ Add New Expense</Text>
      </TouchableOpacity>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.expenseId.toString()}
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
    backgroundColor: '#FFFDEB',
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
    backgroundColor: '#FCD34D',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
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