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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputQty, setInputQty] = useState<string>('');

  useEffect(() => {
    setStocks(stocksData.stocks);
  }, []);

  const handleStockIn = () => {
    if (!selectedId || !inputQty) return;

    setStocks((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? { ...item, quantity: item.quantity + parseInt(inputQty) }
          : item
      )
    );
    resetInput();
  };

  const handleStockOut = () => {
    if (!selectedId || !inputQty) return;

    const qty = parseInt(inputQty);
    const item = stocks.find((i) => i.id === selectedId);
    if (item && item.quantity < qty) {
      Alert.alert('Error', 'Not enough stock to remove.');
      return;
    }

    setStocks((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? { ...item, quantity: item.quantity - qty }
          : item
      )
    );
    resetInput();
  };

  const resetInput = () => {
    setInputQty('');
    setSelectedId(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Stock Management</Text>
      <Text style={styles.subtitle}>Manage Ingredient Inventory</Text>

      <FlatList
        data={stocks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemBox,
              item.id === selectedId && styles.selectedItem,
            ]}
            onPress={() => setSelectedId(item.id)}
          >
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>
              {item.quantity} {item.unit}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No inventory data available.</Text>
        }
      />

      {selectedId && (
        <View style={styles.controls}>
          <TextInput
            style={styles.input}
            placeholder="Enter quantity"
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
    backgroundColor: '#EEF2FF',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4338CA',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
  },
  itemBox: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  selectedItem: {
    // it should be highlighted when selected or animated action up
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemQty: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
  },
  empty: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
  },
  controls: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonIn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonOut: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
