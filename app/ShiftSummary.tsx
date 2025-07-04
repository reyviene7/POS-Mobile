import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import api from '../api';
import OrderDetailsModal from '../src/components/modals/OrderDetailsModal';

interface TodaySalesDTO {
  orderId: string;
  timestamp: string;
  total: number;
  productName: string;
  quantity: number;
  price: number;
  paymentMethod: string | null;
  discount: number;
  deliveryFee: number;
}

interface ShiftOrder {
  orderId: string;
  timestamp: string;
  totalPrice: number;
  paymentMethod: string | null;
  discount: number;
  deliveryFee: number;
  grandTotal: number; // Added
  items: { productName: string; quantity: number; price: number }[];
}

export default function ShiftSummary() {
  const [orders, setOrders] = useState<ShiftOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSales = orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

  const fetchTodaySales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/sales-history/today');
      console.log('Raw backend response:', response.data);
      const data: TodaySalesDTO[] = response.data.map((item: any) => ({
        orderId: item.orderId,
        timestamp: item.timestamp,
        total: item.total,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        paymentMethod: item.paymentMethod,
        discount: item.discount != null ? Number(item.discount) : 0,
        deliveryFee: item.deliveryFee != null ? Number(item.deliveryFee) : 0,
      }));

      const groupedOrders = Object.values(
        data.reduce((acc: { [key: string]: ShiftOrder }, item) => {
          if (!acc[item.orderId]) {
            acc[item.orderId] = {
              orderId: item.orderId,
              timestamp: item.timestamp,
              totalPrice: 0,
              paymentMethod: item.paymentMethod,
              discount: item.discount,
              deliveryFee: item.deliveryFee,
              grandTotal: 0, // Initialize
              items: [],
            };
          }
          acc[item.orderId].items.push({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          });
          acc[item.orderId].totalPrice += item.quantity * item.price;
          acc[item.orderId].grandTotal = acc[item.orderId].totalPrice - item.discount + item.deliveryFee; // Calculate
          return acc;
        }, {})
      );

      console.log('Grouped orders:', groupedOrders);
      setOrders(groupedOrders);
    } catch (err: any) {
      console.error('Error fetching today sales:', err.message, err.response?.data);
      setError('Failed to fetch today’s sales. Please try again.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load today’s sales.',
        position: 'top',
        visibilityTime: 2500,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySales();
  }, []);

  useEffect(() => {
    if (!hasShownInitialToast && orders.length > 0) {
      Toast.show({
        type: 'success',
        text1: '🥪 Freshly Baked!',
        text2: 'Today’s sales loaded successfully!',
        position: 'top',
        visibilityTime: 2500,
        topOffset: 40,
      });
      setHasShownInitialToast(true);
    }
  }, [orders, hasShownInitialToast]);

  const openDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: ShiftOrder }) => (
    <Pressable onPress={() => openDetails(item.orderId)} style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={styles.orderId}>Order #{item.orderId}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {item.items.map((subItem, index) => (
          <Text key={`${item.orderId}-${subItem.productName}`} style={styles.item}>
            {subItem.productName} x{subItem.quantity} – ₱{(subItem.price || 0).toFixed(2)}
          </Text>
        ))}
        <Text style={styles.total}>Subtotal: ₱{(item.totalPrice || 0).toFixed(2)}</Text>
        <Text style={styles.paymentMethod}>Discount: ₱{(item.discount || 0).toFixed(2)}</Text>
        <Text style={styles.paymentMethod}>Delivery Fee: ₱{(item.deliveryFee || 0).toFixed(2)}</Text>
        <Text style={styles.total}>Grand Total: ₱{(item.grandTotal || 0).toFixed(2)}</Text>
        <Text style={styles.paymentMethod}>Payment: {item.paymentMethod || 'None'}</Text>
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
      <Text style={styles.title}>🥚 EggCited Shift Summary</Text>
      <Text style={styles.subtitle}>Daily order earnings at a glance</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Total Sales:</Text>
        <Text style={styles.summaryAmount}>₱{(totalSales || 0).toFixed(2)}</Text>
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
        orderId={selectedOrderId}
        items={selectedOrderId ? orders.find(order => order.orderId === selectedOrderId)?.items || [] : []}
        totalPrice={selectedOrderId ? orders.find(order => order.orderId === selectedOrderId)?.totalPrice || 0 : 0}
        timestamp={selectedOrderId ? orders.find(order => order.orderId === selectedOrderId)?.timestamp || '' : ''}
        paymentMethod={selectedOrderId ? orders.find(order => order.orderId === selectedOrderId)?.paymentMethod || null : null}
        discount={selectedOrderId ? orders.find(order => order.orderId === selectedOrderId)?.discount || 0 : 0}
        deliveryFee={selectedOrderId ? orders.find(order => order.orderId === selectedOrderId)?.deliveryFee || 0 : 0}
        grandTotal={selectedOrderId ? orders.find(order => order.orderId === selectedOrderId)?.grandTotal || 0 : 0} // Added
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('4%'),
  },
  title: {
    fontSize: wp('6.5%'),
    fontWeight: '700',
    textAlign: 'center',
    color: '#B45309',
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: wp('3.8%'),
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: hp('2%'),
  },
  summaryBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: wp('3%'),
    padding: wp('5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('2.5%'),
    elevation: 3,
  },
  summaryLabel: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#92400E',
  },
  summaryAmount: {
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
    color: '#16A34A',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.8%'),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'column',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  orderId: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: wp('3.6%'),
    color: '#6B7280',
  },
  item: {
    fontSize: wp('3.8%'),
    color: '#374151',
    marginBottom: hp('0.5%'),
  },
  total: {
    fontSize: wp('4.4%'),
    fontWeight: 'bold',
    color: '#16A34A',
    marginVertical: hp('1%'),
    textAlign: 'right',
  },
  paymentMethod: {
    fontSize: wp('3.6%'),
    color: '#374151',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: hp('5%'),
    fontStyle: 'italic',
    fontSize: wp('3.8%'),
  },
  listContent: {
    paddingBottom: hp('10%'),
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: hp('2%'),
    fontSize: wp('4%'),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});