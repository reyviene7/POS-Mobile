import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import OrderDetailsModal from '../src/components/OrderDetailsModal';
import shiftSummaryData from '../src/scripts/shift_summary.json';

interface Item {
  name: string;
  quantity: number;
  price: number;
}

interface ShiftOrder {
  orderId: string;
  timestamp: string;
  total: number;
  items: Item[];
}

export default function ShiftSummary() {
  const [orders, setOrders] = useState<ShiftOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ShiftOrder | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);

  useEffect(() => {
    setOrders(shiftSummaryData.shiftSummary);
  }, []);

  const openDetails = (order: ShiftOrder) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: ShiftOrder }) => (
    <Pressable onPress={() => openDetails(item)} style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.orderId}>Order #{item.orderId}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={styles.total}>₱{item.total.toFixed(2)}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🥚 EggCited Shift Summary</Text>
      <Text style={styles.subtitle}>Daily order earnings at a glance</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total Sales:</Text>
        <Text style={styles.summaryAmount}>₱{totalSales.toFixed(2)}</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.orderId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No orders found for this shift.</Text>
        }
      />

      <OrderDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        order={selectedOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB', // Warm yellow background
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#B45309',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  summaryBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 14,
    color: '#6B7280',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 6,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 30,
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 50,
  },
});
