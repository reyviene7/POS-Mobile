import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import OrderDetailsModal from "../src/components/OrderDetailsModal";
import shiftSummaryData from "../src/scripts/shift_summary.json";

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
      <Text style={styles.orderId}>Order: {item.orderId}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
      <Text style={styles.total}>Total: ₱{item.total}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shift Summary</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Total Earned: </Text>
        <Text style={styles.summaryAmount}>₱{totalSales.toFixed(2)}</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.orderId}
        renderItem={renderItem}
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
    padding: 16,
    backgroundColor: "#F3F4F6",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: "#374151",
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  timestamp: {
    fontSize: 14,
    color: "#6B7280",
  },
  total: {
    marginTop: 4,
    fontWeight: "bold",
    color: "#10B981",
  },
});
