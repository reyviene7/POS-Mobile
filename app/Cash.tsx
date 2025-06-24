import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type CashTransaction = {
  id: string;
  orderId: string;
  amount: number;
  timestamp: string;
};

export default function Cash() {
  const [transactions] = useState<CashTransaction[]>([
    {
      id: '1',
      orderId: 'SALE004',
      amount: 636,
      timestamp: '2025-06-21T19:05:00',
    },
    {
      id: '2',
      orderId: 'SALE005',
      amount: 890,
      timestamp: '2025-06-22T11:32:00',
    },
  ]);

  const renderItem = ({ item }: { item: CashTransaction }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.orderId}>🧾 {item.orderId}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <Text style={styles.amount}>₱{item.amount.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
  },
});
