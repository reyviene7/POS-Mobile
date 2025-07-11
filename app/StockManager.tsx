import DeleteModal from '@/src/components/modals/DeleteModal';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import api from '../api';
import StockManagerModal from '../src/components/modals/StockManagerModal';

type StockItem = { id: string; name: string; quantity: number; unit: string };

export default function StockManager() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<string | null>(null);
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/stocks');
      console.log('Raw backend response:', response.data);
      const fetchedStocks: StockItem[] = response.data.map((stock: any) => ({
        id: stock.stockId,
        name: stock.name,
        quantity: stock.quantity,
        unit: stock.unit || 'pcs',
      }));
      console.log('Fetched stocks:', fetchedStocks);
      const sortedStocks = fetchedStocks.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setStocks(sortedStocks);
      setFilteredStocks(sortedStocks);

      if (!hasShownInitialToast) {
        Toast.show({
          type: 'success',
          text1: '🥪 Freshly Baked!',
          text2: 'Stocks loaded successfully!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
        setHasShownInitialToast(true);
      }
    } catch (err: any) {
      console.error('Error fetching stocks:', err.message, err.response?.data);
      setError('Failed to load stocks. Please try again.');
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oh No!',
        text2: 'Failed to load stocks.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    const key = q.toLowerCase();
    const filtered = stocks.filter(i => i.name.toLowerCase().includes(key));
    const sortedFiltered = filtered.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setFilteredStocks(sortedFiltered);
  };

  const saveItem = async (item: StockItem) => {
    setLoading(true);
    try {
      const payload = {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        stockId: item.id || undefined, // Let backend generate ID if new
      };
      console.log('Sending payload:', payload);
      if (item.id) {
        // Update
        const response = await api.put(`/stocks/${item.id}`, payload);
        console.log('Updated stock:', response.data);
        Toast.show({
          type: 'success',
          text1: '🥪 Yum!',
          text2: 'Stock updated successfully!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
      } else {
        // Add
        const response = await api.post('/stocks', payload);
        console.log('Created stock:', response.data);
        Toast.show({
          type: 'success',
          text1: '🥪 Yum!',
          text2: 'Stock added successfully!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
      }
      fetchStocks();
      setModalVisible(false);
    } catch (err: any) {
      console.error('Error saving stock:', err.message, err.response?.data);
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: 'Failed to save stock.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = (id: string) => {
    setStockToDelete(id);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!stockToDelete) return;
    setDeleteConfirmVisible(false);
    setLoading(true);
    try {
      await api.delete(`/stocks/${stockToDelete}`);
      console.log('Deleted stock:', stockToDelete);
      Toast.show({
        type: 'success',
        text1: '🥪 Yum!',
        text2: 'Stock removed successfully!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      fetchStocks();
    } catch (err: any) {
      console.error('Error deleting stock:', err.message, err.response?.data);
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: 'Failed to delete stock.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
      setStockToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setStockToDelete(null);
  };

  const renderItem = ({ item }: { item: StockItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setEditingItem(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.leftSection}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQty}>{item.quantity} {item.unit}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteItem(item.id)}>
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
      <Text style={styles.title}>📦 EggCited Stock Manager</Text>
      <Text style={styles.subtitle}>Manage your sandwich ingredients</Text>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => { setEditingItem(null); setModalVisible(true); }}
      >
        <Text style={styles.addBtnText}>+ Add Ingredient</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.searchBar}
        placeholder="Search ingredients..."
        placeholderTextColor="#4B5563"
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredStocks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No ingredients found 🧺</Text>
        }
      />
      <StockManagerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={saveItem}
        item={editingItem}
      />
      <DeleteModal
        visible={deleteConfirmVisible}
        itemType="stock"
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
    color: '#B45309',
    textAlign: 'center',
    marginBottom: hp('0.8%'),
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: hp('2.5%'),
  },
  searchBar: {
    backgroundColor: '#fff',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2.5%'),
    marginBottom: hp('1.5%'),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: wp('4%'),
  },
  addBtn: {
    backgroundColor: '#FCD34D',
    borderRadius: wp('3%'),
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('7%'),
    alignSelf: 'center',
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  addBtnText: {
    color: '#92400E',
    fontSize: wp('4.2%'),
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    borderRadius: wp('3%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftSection: {
    flex: 1,
  },
  itemName: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#1F2937',
  },
  itemQty: {
    fontSize: wp('4%'),
    color: '#10B981',
    marginTop: hp('0.3%'),
  },
  delete: {
    fontSize: wp('5.5%'),
    paddingHorizontal: wp('2.5%'),
  },
  empty: {
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