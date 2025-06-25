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
import CreditModal from '../src/components/CreditModal';

type CreditRecord = {
  creditId: number;
  orderId: string;
  customerName: string;
  amount: number;
  paid: number;
  dueDate: string;
  timestamp: string;
};

export default function Credit() {
  const [credits, setCredits] = useState<CreditRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CreditRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/credit-transactions');
      console.log('Raw backend response:', response.data);
      const fetchedCredits: CreditRecord[] = response.data.map((credit: any) => ({
        creditId: credit.creditId,
        orderId: credit.salesHistory?.orderId || credit.orderId || '',
        customerName: credit.customerName,
        amount: parseFloat(credit.amount) || 0,
        paid: parseFloat(String(credit.paid ?? '0')) || 0,
        dueDate: credit.dueDate ? new Date(credit.dueDate).toISOString() : '',
        timestamp: credit.timestamp ? new Date(credit.timestamp).toISOString() : '',
      }));
      console.log('Fetched credits:', fetchedCredits);
      setCredits(fetchedCredits);
    } catch (err: any) {
      console.error('Error fetching credits:', err.message, err.response?.data);
      setError('Failed to load credit records. Please try again.');
      Alert.alert('Error', 'Failed to load credit records.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCredit(null);
    setModalVisible(true);
  };

  const handleEdit = (record: CreditRecord) => {
    console.log('Editing credit:', record);
    setSelectedCredit(record);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Credit', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.delete(`/credit-transactions/${id}`);
            console.log('Deleted credit:', id);
            Alert.alert('Success', 'Credit record deleted successfully!');
            fetchCredits();
          } catch (err: any) {
            console.error('Error deleting credit:', err.message, err.response?.data);
            Alert.alert('Error', 'Failed to delete credit record.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSave = async (credit: Omit<CreditRecord, 'creditId'>) => {
    setLoading(true);
    try {
      const payload = {
        orderId: credit.orderId,
        customerName: credit.customerName,
        amount: credit.amount,
        paid: credit.paid,
        dueDate: credit.dueDate ? new Date(credit.dueDate).toISOString().split('T')[0] : null,
        timestamp: credit.timestamp || new Date().toISOString(),
      };
      console.log('Sending payload:', payload);
      if (selectedCredit) {
        // Update existing
        const response = await api.put(`/credit-transactions/${selectedCredit.creditId}`, payload);
        console.log('Updated credit:', response.data);
        Alert.alert('Success', 'Credit record updated successfully!');
      } else {
        // Add new
        const response = await api.post('/credit-transactions', payload);
        console.log('Created credit:', response.data);
        Alert.alert('Success', 'Credit record created successfully!');
      }
      fetchCredits();
      setModalVisible(false);
    } catch (err: any) {
      console.error('Error saving credit:', err.message, err.response?.data);
      Alert.alert('Error', 'Failed to save credit record. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Total: ₱{item.amount.toFixed(2)} | Paid: ₱{item.paid.toFixed(2)} |{' '}
            <Text style={styles.unpaid}>Unpaid: ₱{balance.toFixed(2)}</Text>
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleDelete(item.creditId)}>
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FCD34D" />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.title}>🏦 Credit</Text>
      <Text style={styles.subtitle}>Track customer utang and partial payments</Text>
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>+ Add Credit Record</Text>
      </TouchableOpacity>
      <FlatList
        data={credits}
        keyExtractor={(item) => item.creditId.toString()}
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
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FCD34D',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  buttonText: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '700',
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