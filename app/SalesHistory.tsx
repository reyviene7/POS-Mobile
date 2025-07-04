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
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

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
  discount: number;
  deliveryFee: number;
  grandTotal: number;
}

interface Sale {
  orderId: string;
  timestamp: string;
  totalPrice: number;
  paymentMethod: string | null;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
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
      console.log('Raw backend response:', response.data); // Debug API response
      const data: SalesHistoryDetailed[] = response.data.map((item: any) => {
        console.log('Mapping item:', item); // Debug each item
        return {
          orderId: item.order_id,
          productName: item.product_name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.total_price,
          saleDate: item.sale_date,
          saleTime: item.sale_time,
          timestamp: item.timestamp,
          paymentMethod: item.payment_method,
          discount: item.discount != null ? Number(item.discount) : 0, // Ensure number
          deliveryFee: item.delivery_fee != null ? Number(item.delivery_fee) : 0, // Ensure number
          grandTotal: item.grand_total != null ? Number(item.grand_total) : 0, // Ensure number
        };
      });

      const groupedSales = Object.values(
        data.reduce((acc: { [key: string]: Sale }, item) => {
          if (!acc[item.orderId]) {
            acc[item.orderId] = {
              orderId: item.orderId,
              timestamp: item.timestamp,
              totalPrice: 0,
              paymentMethod: item.paymentMethod,
              discount: item.discount,
              deliveryFee: item.deliveryFee,
              grandTotal: item.grandTotal,
              items: [],
            };
          }
          acc[item.orderId].items.push({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          });
          acc[item.orderId].totalPrice += item.quantity * item.price;
          return acc;
        }, {})
      );

      console.log('Grouped sales:', groupedSales); // Debug grouped data
      setSales(groupedSales);
      setFilteredSales(groupedSales);

      const total = groupedSales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
      setTotalSales(total);
    } catch (err: any) {
      console.error('Error fetching sales:', err.message, err.response?.data); // Debug error
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load sales history.",
        position: "top",
        visibilityTime: 2500,
        topOffset: 40,
      });
      setError('Failed to load sales history.');
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
      const total = filtered.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
      setTotalSales(total);
    } else {
      setFilteredSales(sales);
      const total = sales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
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
      console.error('Error deleting order:', err.message, err.response?.data); // Debug error
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
            {subItem.productName} x{subItem.quantity} – ₱{(subItem.price || 0).toFixed(2)}
          </Text>
        ))}
        <Text style={styles.totalPrice}>Subtotal: ₱{(item.totalPrice || 0).toFixed(2)}</Text>
        <Text style={styles.paymentMethod}>Discount: ₱{(item.discount || 0).toFixed(2)}</Text>
        <Text style={styles.paymentMethod}>Delivery Fee: ₱{(item.deliveryFee || 0).toFixed(2)}</Text>
        <Text style={styles.totalPrice}>Grand Total: ₱{(item.grandTotal || 0).toFixed(2)}</Text>
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
        <Text style={styles.summaryAmount}>₱{(totalSales || 0).toFixed(2)}</Text>
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
        discount={selectedOrderId ? sales.find(sale => sale.orderId === selectedOrderId)?.discount || 0 : 0}
        deliveryFee={selectedOrderId ? sales.find(sale => sale.orderId === selectedOrderId)?.deliveryFee || 0 : 0}
        grandTotal={selectedOrderId ? sales.find(sale => sale.orderId === selectedOrderId)?.grandTotal || 0 : 0}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
  },
  title: {
    fontSize: wp('6.5%'),
    fontWeight: "bold",
    color: "#B45309",
    textAlign: "center",
    marginBottom: hp('1.5%'),
  },
  subtitle: {
    fontSize: wp('3.8%'),
    textAlign: "center",
    color: "#6B7280",
    marginBottom: hp('2%'),
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FEF3C7",
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('2.5%'),
    elevation: 2,
  },
  summaryText: {
    fontSize: wp('4.2%'),
    fontWeight: "500",
    color: "#92400E",
  },
  summaryAmount: {
    fontSize: wp('4.2%'),
    fontWeight: "bold",
    color: "#10B981",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginHorizontal: wp('2.5%'),
    marginBottom: hp('1.8%'),
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
    marginBottom: hp('2%'),
    gap: wp('2%'),
  },
  orderId: {
    fontSize: wp('4.4%'),
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: hp('1%'),
  },
  item: {
    fontSize: wp('3.8%'),
    color: "#374151",
    marginBottom: hp('0.5%'),
  },
  totalPrice: {
    fontSize: wp('4.4%'),
    fontWeight: "700",
    color: "#16A34A",
    marginVertical: hp('1%'),
  },
  timestamp: {
    fontSize: wp('3.6%'),
    color: "#6B7280",
    marginBottom: hp('0.5%'),
  },
  paymentMethod: {
    fontSize: wp('3.6%'),
    color: "#374151",
    marginBottom: hp('0.5%'),
  },
  emptyText: {
    marginTop: hp('5%'),
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: wp('4%'),
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    marginBottom: hp('2%'),
    fontSize: wp('4.2%'),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});