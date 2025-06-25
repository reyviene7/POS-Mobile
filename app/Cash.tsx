import { Ionicons } from '@expo/vector-icons';
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
import CashModal from '../src/components/CashModal';

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

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cash-transactions');
      console.log('Raw backend response:', response.data);
      const fetchedTransactions: CashTransaction[] = response.data.map((transaction: any) => ({
        id: transaction.cashId.toString(),
        orderId: transaction.salesHistory?.orderId || transaction.orderId || '',
        amount: parseFloat(transaction.amount) || 0,
        timestamp: transaction.timestamp ? new Date(transaction.timestamp).toISOString() : '',
      }));
      console.log('Fetched transactions:', fetchedTransactions);
      setTransactions(fetchedTransactions);
    } catch (err: any) {
      console.error('Error fetching transactions:', err.message, err.response?.data);
      setError('Failed to load cash transactions. Please try again.');
      Alert.alert('Error', 'Failed to load cash transactions.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction: CashTransaction) => {
    console.log('Editing transaction:', transaction);
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.delete(`/cash-transactions/${id}`);
            console.log('Deleted transaction:', id);
            Alert.alert('Success', 'Cash transaction deleted successfully!');
            fetchTransactions();
          } catch (err: any) {
            console.error('Error deleting transaction:', err.message, err.response?.data);
            Alert.alert('Error', 'Failed to delete cash transaction.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
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
      console.log('Sending payload:', payload);
      const response = await api.put(`/cash-transactions/${selectedTransaction.id}`, payload);
      console.log('Updated transaction:', response.data);
      Alert.alert('Success', 'Cash transaction updated successfully!');
      fetchTransactions();
      setModalVisible(false);
    } catch (err: any) {
      console.error('Error saving transaction:', err.message, err.response?.data);
      Alert.alert('Error', 'Failed to save cash transaction. Please try again.');
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
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
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
    marginTop: 40,
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