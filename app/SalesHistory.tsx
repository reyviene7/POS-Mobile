// screens/SalesHistory.tsx

import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import OrderDetailsModal from "../src/components/OrderDetailsModal";
import salesHistoryData from "../src/scripts/sales_history.json";

interface Item {
  name: string;
  quantity: number;
  price: number;
}

interface Sale {
  orderId: string;
  timestamp: string;
  total: number;
  items: Item[];
}

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [totalSales, setTotalSales] = useState<number>(0);

  useEffect(() => {
    const loadedSales = salesHistoryData.sales;
    setSales(loadedSales);

    const total = loadedSales.reduce((sum, sale) => sum + sale.total, 0);
    setTotalSales(total);
  }, []);

  const openDetails = (order: Sale) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Sale }) => (
    <Pressable onPress={() => openDetails(item)} style={styles.card}>
      <Text style={styles.orderId}>Order: {item.orderId}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
      <Text style={styles.total}>₱{item.total}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales History</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Total Earned: </Text>
        <Text style={styles.summaryAmount}>₱{totalSales.toFixed(2)}</Text>
      </View>

      <FlatList
        data={sales}
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
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
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
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 4,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    color: "#059669",
  },
});
