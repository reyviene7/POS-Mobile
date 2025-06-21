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
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>#{item.orderId}</Text>
        <Text style={styles.total}>₱{item.total.toFixed(2)}</Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Sales History</Text>
      <Text style={styles.subtitle}>Every transaction tells a story</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Total Sales:</Text>
        <Text style={styles.summaryAmount}>₱{totalSales.toFixed(2)}</Text>
      </View>

      <FlatList
        data={sales}
        keyExtractor={(item) => item.orderId}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No sales records available.</Text>
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
    backgroundColor: "#FFFBEB", // soft warm yellow
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#B45309", // warm orange-brown
    textAlign: "center",
    marginBottom: 16,
  },
  
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FEF3C7", // lighter egg yellow
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#92400E",
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  total: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16A34A",
  },
  timestamp: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 16,
  },
});
