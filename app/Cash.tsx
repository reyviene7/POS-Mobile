import { Ionicons } from '@expo/vector-icons';
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
import CashModal from '../src/components/modals/CashModal';
import DeleteModal from '../src/components/modals/DeleteModal';

type CashTransaction = {
  id: string;
  orderId: string;
  amount: number;
  timestamp: string;
};

export default function Cash() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CashTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cash-transactions');
      const fetchedTransactions: CashTransaction[] = response.data.map((transaction: any) => ({
        id: transaction.cashId.toString(),
        orderId: transaction.salesHistory?.orderId || transaction.orderId || '',
        amount: parseFloat(transaction.amount) || 0,
        timestamp: transaction.timestamp ? new Date(transaction.timestamp).toISOString() : '',
      }));
      setTransactions(fetchedTransactions);
      if (!hasShownInitialToast) {
        Toast.show({
          type: 'success',
          text1: '🥪 Freshly Baked!',
          text2: 'Cash transactions loaded successfully!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
        setHasShownInitialToast(true);
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oh No!',
        text2: 'Failed to load cash transactions.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
    setDeleteConfirmVisible(true);
  };

  const handleEdit = (transaction: CashTransaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    setDeleteConfirmVisible(false);
    setLoading(true);
    try {
      await api.delete(`/cash-transactions/${transactionToDelete}`);
      Toast.show({
        type: 'success',
        text1: '🥪 Yum!',
        text2: 'Cash transaction removed successfully!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      fetchTransactions();
    } catch {
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: 'Failed to delete cash transaction.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
      setTransactionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setTransactionToDelete(null);
  };

  const handleSave = async (transaction: Omit<CashTransaction, 'id'>) => {
    if (!selectedTransaction) return;
    setLoading(true);
    try {
      const payload = {
        orderId: transaction.orderId,
        amount: transaction.amount,
        timestamp: transaction.timestamp || new Date().toISOString(),
      };
      const response = await api.put(`/cash-transactions/${selectedTransaction.id}`, payload);
      Toast.show({
        type: 'success',
        text1: '🥪 Yum!',
        text2: 'Cash transaction updated successfully!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      fetchTransactions();
      setModalVisible(false);
    } catch {
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: 'Failed to save cash transaction.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: CashTransaction }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleEdit(item)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.orderId}>🧾 {item.orderId}</Text>
        <Text style={styles.timestamp}>
          🕒 {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <View style={styles.actions}>
        <Text style={styles.amount}>₱{item.amount.toFixed(2)}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 10 }}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.title}>💰 Cash</Text>
      <Text style={styles.subtitle}>Showing all cash-based transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No cash transactions available.</Text>
        }
      />
      <CashModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        transaction={selectedTransaction}
        onSave={handleSave}
        onDelete={() => handleDelete(selectedTransaction?.id || '')}
      />
      <DeleteModal
        visible={deleteConfirmVisible}
        itemType="cash record"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
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
    fontSize: wp('6.5%'),
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: hp('0.8%'),
  },
  subtitle: {
    fontSize: wp('4.2%'),
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: hp('2%'),
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginHorizontal: wp('2.5%'),
    marginBottom: hp('1.8%'),
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  orderId: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: wp('3.6%'),
    color: '#6B7280',
    marginTop: hp('0.5%'),
  },
  amount: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#22C55E',
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: hp('5%'),
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
    fontSize: wp('4.2%'),
  },
});