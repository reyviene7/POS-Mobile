import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../api";
import OrderDetailsModal from "../src/components/modals/OrderDetailsModal";

interface SalesHistoryDetailed {
  orderId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  saleDate: string;
  saleTime: string;
  timestamp: string;
  paymentMethod: string | null;
}

interface Sale {
  orderId: string;
  timestamp: string;
  totalPrice: number;
  paymentMethod: string | null;
  items: { productName: string; quantity: number; price: number }[];
}

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<{ mode: "from" | "to" | null }>({ mode: null });

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/sales-history/detailed");
      const data: SalesHistoryDetailed[] = response.data.map((item: any) => ({
        orderId: item.order_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.total_price,
        saleDate: item.sale_date,
        saleTime: item.sale_time,
        timestamp: item.timestamp,
        paymentMethod: item.payment_method,
      }));

      const groupedSales = Object.values(
        data.reduce((acc: { [key: string]: Sale }, item) => {
          if (!acc[item.orderId]) {
            acc[item.orderId] = {
              orderId: item.orderId,
              timestamp: item.timestamp,
              totalPrice: 0, 
              paymentMethod: item.paymentMethod,
              items: [],
            };
          }
          acc[item.orderId].items.push({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          });
          acc[item.orderId].totalPrice += item.quantity * item.price; // Sum quantity * price
          return acc;
        }, {})
      );

      setSales(groupedSales);
      setFilteredSales(groupedSales);

      const total = groupedSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
      setTotalSales(total);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load sales history.",
        position: "top",
        visibilityTime: 2500,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    if (!hasShownInitialToast && sales.length > 0) {
      Toast.show({
        type: "success",
        text1: "🥪 Freshly Baked!",
        text2: "Sales history loaded!",
        position: "top",
        visibilityTime: 2500,
        topOffset: 40,
      });
      setHasShownInitialToast(true);
    }
  }, [sales, hasShownInitialToast]);

  useEffect(() => {
    if (fromDate && toDate) {
      const filtered = sales.filter((sale) => {
        const saleTime = new Date(sale.timestamp).getTime();
        return (
          saleTime >= fromDate.getTime() &&
          saleTime <= toDate.getTime() + 86400000 // Include full day
        );
      });
      setFilteredSales(filtered);
      const total = filtered.reduce((sum, sale) => sum + sale.totalPrice, 0);
      setTotalSales(total);
    } else {
      setFilteredSales(sales);
      const total = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
      setTotalSales(total);
    }
  }, [fromDate, toDate, sales]);

  const handleDelete = async (orderId: string) => {
    setLoading(true);
    try {
      await api.delete(`/sales-history/${orderId}`);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Order deleted successfully!",
        position: "top",
        visibilityTime: 2500,
        topOffset: 40,
      });
      fetchSales();
      setModalVisible(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete order.",
        position: "top",
        visibilityTime: 2500,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalVisible(true);
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    if (showPicker.mode === "from") {
      setFromDate(selectedDate);
    } else if (showPicker.mode === "to") {
      setToDate(selectedDate);
    }
    setShowPicker({ mode: null });
  };

  const renderItem = ({ item }: { item: Sale }) => (
    <Pressable onPress={() => openDetails(item.orderId)} style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.orderId}>Order ID: #{item.orderId}</Text>
        {item.items.map((subItem, index) => (
          <Text key={`${item.orderId}-${subItem.productName}`} style={styles.item}>
            {subItem.productName} x{subItem.quantity} – ₱{subItem.price.toFixed(2)}
          </Text>
        ))}
        <Text style={styles.totalPrice}>Total: ₱{item.totalPrice.toFixed(2)}</Text>
        <Text style={styles.timestamp}>
          Timestamp: {new Date(item.timestamp).toLocaleString()}
        </Text>
        <Text style={styles.paymentMethod}>
          Payment: {item.paymentMethod || "None"}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.title}>📊 Sales History</Text>
      <Text style={styles.subtitle}>Every transaction tells a story</Text>
      <View style={styles.dateRange}>
        <Button
          title={`📅 From: ${fromDate ? fromDate.toLocaleDateString() : "Select"}`}
          onPress={() => setShowPicker({ mode: "from" })}
          color="#F59E0B"
        />
        <Button
          title={`📅 To: ${toDate ? toDate.toLocaleDateString() : "Select"}`}
          onPress={() => setShowPicker({ mode: "to" })}
          color="#D97706"
        />
      </View>
      {showPicker.mode && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateChange}
        />
      )}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Total Sales:</Text>
        <Text style={styles.summaryAmount}>₱{totalSales.toFixed(2)}</Text>
      </View>
      <FlatList
        data={filteredSales}
        keyExtractor={(item) => item.orderId}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No sales in selected range.</Text>
        }
      />
      <OrderDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        orderId={selectedOrderId}
        items={selectedOrderId ? sales.find(sale => sale.orderId === selectedOrderId)?.items || [] : []}
        totalPrice={selectedOrderId ? sales.find(sale => sale.orderId === selectedOrderId)?.totalPrice || 0 : 0}
        timestamp={selectedOrderId ? sales.find(sale => sale.orderId === selectedOrderId)?.timestamp || "" : ""}
        paymentMethod={selectedOrderId ? sales.find(sale => sale.orderId === selectedOrderId)?.paymentMethod || null : null}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBEB",
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#B45309",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 16,
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FEF3C7",
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
    marginHorizontal: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    flexDirection: "column",
  },
  dateRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  item: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16A34A",
    marginVertical: 8,
  },
  timestamp: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 16,
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});