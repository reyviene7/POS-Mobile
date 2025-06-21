import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import stocksData from '../src/scripts/stocks.json';

type StockItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

export default function StockManager() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputQty, setInputQty] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const initialStocks = stocksData.stocks;
    setStocks(initialStocks);
    setFilteredStocks(initialStocks);
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    const keyword = query.toLowerCase();
    const filtered = stocks.filter(item =>
      item.name.toLowerCase().includes(keyword)
    );
    setFilteredStocks(filtered);
  };

  const handleStockIn = () => {
    if (!selectedId || !inputQty) return;

    setStocks(prev =>
      prev.map(item =>
        item.id === selectedId
          ? { ...item, quantity: item.quantity + parseInt(inputQty) }
          : item
      )
    );
    setFilteredStocks(prev =>
      prev.map(item =>
        item.id === selectedId
          ? { ...item, quantity: item.quantity + parseInt(inputQty) }
          : item
      )
    );
    Alert.alert('Success', 'Stock successfully added.');
    resetInput();
  };

  const handleStockOut = () => {
    if (!selectedId || !inputQty) return;

    const qty = parseInt(inputQty);
    const item = stocks.find(i => i.id === selectedId);
    if (item && item.quantity < qty) {
      Alert.alert('Error', 'Not enough stock to remove.');
      return;
    }

    setStocks(prev =>
      prev.map(item =>
        item.id === selectedId
          ? { ...item, quantity: item.quantity - qty }
          : item
      )
    );
    setFilteredStocks(prev =>
      prev.map(item =>
        item.id === selectedId
          ? { ...item, quantity: item.quantity - qty }
          : item
      )
    );
    Alert.alert('Success', 'Stock successfully deducted.');
    resetInput();
  };

  const resetInput = () => {
    setInputQty('');
    setSelectedId(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 EggCited Stock Manager</Text>
      <Text style={styles.subtitle}>Manage your sandwich ingredients</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search ingredients..."
        value={search}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredStocks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedId;
          return (
            <TouchableOpacity
              style={[styles.itemBox, isSelected && styles.selectedItem]}
              onPress={() => setSelectedId(item.id)}
            >
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>
                {item.quantity} {item.unit}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No matching ingredients found.</Text>
        }
      />

      {selectedId && (
        <View style={styles.controls}>
          <Text style={styles.inputLabel}>Enter Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5"
            keyboardType="numeric"
            value={inputQty}
            onChangeText={setInputQty}
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.buttonIn} onPress={handleStockIn}>
              <Text style={styles.buttonText}>➕ Stock In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonOut} onPress={handleStockOut}>
              <Text style={styles.buttonText}>➖ Stock Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEA',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#B45309',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  itemBox: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedItem: {
    borderColor: '#4F46E5',
    borderWidth: 2,
    backgroundColor: '#E0E7FF',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemQty: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  empty: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
  },
  controls: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  buttonIn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonOut: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
