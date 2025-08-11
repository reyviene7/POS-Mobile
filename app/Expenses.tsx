import DeleteModal from '@/src/components/modals/DeleteModal';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import api from '../api';
import ExpensesModal from '../src/components/modals/ExpensesModal';

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
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);
  const formatDateTime = (timestamp: string) => {
    const now = new Date(timestamp);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}  ${hours}:${minutes} ${ampm}`;
  };
  
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
      if (!hasShownInitialToast) {
        Toast.show({
          type: 'success',
          text1: '🥪 Freshly Baked!',
          text2: 'Expenses loaded successfully!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
        setHasShownInitialToast(true);
      }
    } catch (err: any) {
      console.error('Error fetching expenses:', err.message, err.response?.data);
      setError('Failed to load expenses. Please try again.');
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oh No!',
        text2: 'Failed to load expenses.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
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
        Toast.show({
          type: 'success',
          text1: '🥪 Yum!',
          text2: 'Expense updated successfully!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
      } else {
        // Add new
        const response = await api.post('/expenses', payload);
        console.log('Created expense:', response.data);
        Toast.show({
          type: 'success',
          text1: '🥪 Yum!',
          text2: 'Expense created successfully!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
      }
      fetchExpenses();
      setModalVisible(false);
    } catch (err: any) {
      console.error('Error saving expense:', err.message, err.response?.data);
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: 'Failed to save expense.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setExpenseToDelete(id);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    setDeleteConfirmVisible(false);
    setLoading(true);
    try {
      await api.delete(`/expenses/${expenseToDelete}`);
      console.log('Deleted expense:', expenseToDelete);
      Toast.show({
        type: 'success',
        text1: '🥪 Yum!',
        text2: 'Expense removed successfully!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      fetchExpenses();
    } catch (err: any) {
      console.error('Error deleting expense:', err.message, err.response?.data);
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: 'Failed to delete expense.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
      setExpenseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setExpenseToDelete(null);
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEditModal(item)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.remarks}>{item.remarks || 'No remarks'}</Text>
        <Text style={styles.datetime}>
          {formatDateTime(item.timestamp)}
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
      <DeleteModal
        visible={deleteConfirmVisible}
        itemType="expense"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
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
    paddingHorizontal: wp('5%'),
    paddingTop: hp('6%'),
  },
  title: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: wp('4%'),
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: hp('2%'),
  },
  addButton: {
    backgroundColor: '#FCD34D',
    borderRadius: wp('3%'),
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('8%'),
    alignSelf: 'center',
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  addButtonText: {
    color: '#92400E',
    fontSize: wp('4%'),
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginHorizontal: wp('3%'),
    marginBottom: hp('1.5%'),
    elevation: 2,
  },
  type: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  remarks: {
    fontSize: wp('3.8%'),
    color: '#6B7280',
    marginTop: hp('0.3%'),
  },
  datetime: {
    fontSize: wp('3.2%'),
    color: '#9CA3AF',
    marginTop: hp('0.5%'),
  },
  side: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: wp('3%'),
  },
  amount: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#16A34A',
  },
  deleteBtn: {
    marginTop: hp('0.5%'),
    padding: wp('1.5%'),
  },
  deleteText: {
    fontSize: wp('5%'),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: hp('6%'),
    color: '#9CA3AF',
    fontSize: wp('4%'),
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
    marginBottom: hp('2%'),
    fontSize: wp('4%'),
  },
});