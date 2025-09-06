import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import api from '../api';

type Product = {
  productId: string;
  productName: string;
  categoryName: string;
  size: string | null;
  price: number;
  image: string | null;
  flavorName: string | null;
};

type Addon = {
  addonId: number;
  addonName: string;
  price: number;
};

type CartItem = {
  product: Product;
  quantity: number;
  addons: { [addonId: string]: number };
  addonDetails: Addon[];
};

export default function AmountReceived() {
  const router = useRouter();
  const {
    cart: cartString,
    customerName,
    customerNumber,
    customerAddress,
    notes,
    discount,
    deliveryFee,
    total,
    method,
  } = useLocalSearchParams();

  const cart: CartItem[] = cartString ? JSON.parse(cartString as string) : [];
  const payable = parseFloat(total as string || '0');
  const parsedDiscount = parseFloat(discount as string || '0') || 0;
  const parsedDeliveryFee = parseFloat(deliveryFee as string || '0') || 0;

  const [received, setReceived] = useState('');
  const [change, setChange] = useState(0);

  const suggestedBills = [10, 20, 50, 100, 200, 300, 400, 500, 1000];

  const calculateSubtotal = () => {
    let subtotal = 0;
    if (Array.isArray(cart)) {
      cart.forEach((item) => {
        const productCost = item.product.price * item.quantity;
        const addonCost = Object.entries(item.addons).reduce((sum, [addonId, qty]) => {
          const addon = item.addonDetails?.find((a) => a.addonId === Number(addonId));
          return sum + (addon ? addon.price * qty : 0);
        }, 0);
        subtotal += productCost + addonCost;
      });
    }
    return subtotal;
  };

  const subtotal = calculateSubtotal();

  const handleBillPress = (amount: number) => {
    const current = parseFloat(received || '0');
    const newAmount = current + amount;
    setReceived(newAmount.toFixed(2));
    setChange(newAmount - payable);
  };

  const handleInputChange = (value: string) => {
    setReceived(value);
    const num = parseFloat(value || '0');
    setChange(num - payable);
  };

  const handleExactAmount = () => {
    setReceived(payable.toFixed(2));
    setChange(0);
  };

  const handleProceed = async () => {
    if (!received || parseFloat(received) < payable) {
      Toast.show({
        type: 'error',
        text1: '💸 Insufficient Amount',
        text2: 'Amount received must be greater than or equal to the amount payable.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }

    try {
      // Generate order ID
      const orderIdRes = await api.get('/sales-history/order-ids');
      const existingOrderIds: string[] = orderIdRes.data;
      const numericParts = existingOrderIds
        .filter(id => /^SALE\d+$/.test(id))
        .map(id => parseInt(id.replace('SALE', ''), 10));
      const nextReceiptNumber = numericParts.length > 0 ? Math.max(...numericParts) + 1 : 1;
      const formattedReceiptNo = nextReceiptNumber.toString().padStart(3, '0');
      const orderId = `SALE${formattedReceiptNo}`;

      // Build payload with discount and deliveryFee
      const orderDTO = {
        orderId,
        timestamp: new Date().toISOString(),
        total: parseFloat(payable.toFixed(2)),
        paymentMethodId: method === 'Cash' ? 1 : method === 'Credit' ? 2 : method === 'GCash' ? 3 : null,
        discount: parseFloat(parsedDiscount.toFixed(2)), // Include discount
        deliveryFee: parseFloat(parsedDeliveryFee.toFixed(2)), // Include deliveryFee
        items: cart.map(item => ({
          productName: `${item.product.productName}${item.product.size ? ` (${item.product.size})` : ''}${item.product.flavorName ? ` - ${item.product.flavorName}` : ''}`,
          quantity: item.quantity,
          price: parseFloat(
            (
              item.product.price +
              Object.entries(item.addons).reduce((sum, [addonId, qty]) => {
                const addon = item.addonDetails.find(a => a.addonId === Number(addonId));
                return sum + (addon ? addon.price * qty : 0);
              }, 0)
            ).toFixed(2)
          ),
        })),
      };

      console.log('AmountReceived: Sending order to /sales-history:', orderDTO);

      // Send POST request to /sales-history
      const response = await api.post('/sales-history', orderDTO);
      console.log('AmountReceived: Order saved successfully:', response.data);

      // Navigate to PaymentComplete
      router.push({
        pathname: '/PaymentComplete',
        params: {
          cart: JSON.stringify(cart),
          customerName: customerName || '',
          customerNumber: customerNumber || '',
          customerAddress: customerAddress || '',
          notes: notes || '',
          discount: parsedDiscount.toFixed(2),
          deliveryFee: parsedDeliveryFee.toFixed(2),
          total: payable.toFixed(2),
          received: parseFloat(received || '0').toFixed(2),
          method: method as string,
          change: change.toFixed(2),
          receiptNo: formattedReceiptNo,
        },
      });
    } catch (error: any) {
      console.error('AmountReceived: Failed to save order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save order to server. Please try again.';
      Toast.show({
        type: 'error',
        text1: '💸 Order Save Failed',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Order Summary</Text>

          {/* Cart Items */}
          <View style={styles.cartContainer}>
            <Text style={styles.sectionTitle}>Items</Text>
            {Array.isArray(cart) && cart.length > 0 ? (
              cart.map((item, index) => (
                <View
                  key={`${item.product.productId}-${item.product.size || ''}-${item.product.flavorName || ''}`}
                  style={styles.cartItem}
                >
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>
                      {item.product.productName} {item.product.size ? `(${item.product.size})` : ''}{' '}
                      {item.product.flavorName ? `- ${item.product.flavorName}` : ''}
                    </Text>
                    {Object.entries(item.addons).length > 0 && (
                      <View style={styles.addonContainer}>
                        {Object.entries(item.addons).map(([addonId, qty]) => {
                          const addon = item.addonDetails?.find((a) => a.addonId === Number(addonId));
                          return addon ? (
                            <Text key={addonId} style={styles.addonText}>
                              {addon.addonName} x{qty} (₱{(addon.price * qty).toFixed(2)})
                            </Text>
                          ) : null;
                        })}
                      </View>
                    )}
                    <Text style={styles.itemSubtotal}>
                      ₱{(
                        item.product.price * item.quantity +
                        Object.entries(item.addons).reduce((sum, [addonId, qty]) => {
                          const addon = item.addonDetails?.find((a) => a.addonId === Number(addonId));
                          return sum + (addon ? addon.price * qty : 0);
                        }, 0)
                      ).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyCartText}>No items in cart</Text>
            )}
          </View>

          {/* Totals */}
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>₱{(subtotal || 0).toFixed(2)}</Text>
            </View>
            {parsedDiscount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={styles.totalValue}>-₱{(parsedDiscount || 0).toFixed(2)}</Text>
              </View>
            )}
            {parsedDeliveryFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Delivery Fee:</Text>
                <Text style={styles.totalValue}>₱{(parsedDeliveryFee || 0).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>AMOUNT PAYABLE:</Text>
              <Text style={styles.amount}>₱{(payable || 0).toFixed(2)}</Text>
            </View>
          </View>

          {/* Customer Details */}
          {(customerName || customerNumber || customerAddress || notes) && (
            <View style={styles.customerContainer}>
              <Text style={styles.sectionTitle}>Customer Details</Text>
              {customerName && (
                <Text style={styles.customerText}>Name: {customerName}</Text>
              )}
              {customerNumber && (
                <Text style={styles.customerText}>Number: {customerNumber}</Text>
              )}
              {customerAddress && (
                <Text style={styles.customerText}>Address: {customerAddress}</Text>
              )}
              {notes && <Text style={styles.customerText}>Notes: {notes}</Text>}
            </View>
          )}

          {/* Amount Received Input */}
          <View style={styles.centered}>
            <Text style={styles.subLabel}>Amount Received</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount received"
              placeholderTextColor="#4B5563"
              keyboardType="numeric"
              value={received}
              onChangeText={handleInputChange}
            />
          </View>

          <View style={styles.centered}>
            <Text style={styles.suggestion}>Type or select bill tendered</Text>
          </View>

          <View style={styles.billsContainer}>
            {suggestedBills.map((bill) => (
              <TouchableOpacity
                key={bill}
                style={styles.billButton}
                onPress={() => handleBillPress(bill)}
              >
                <Text style={styles.billText}>₱{bill}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.centered}>
            <Text style={styles.changeLabel}>Change: ₱{(change || 0).toFixed(2)}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.exactButton]} 
              onPress={handleExactAmount}
            >
              <Text style={styles.exactButtonText}>EXACT AMOUNT</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.proceedButton]} 
              onPress={handleProceed}
            >
              <Text style={styles.proceedText}>PROCEED</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    padding: wp('5%'),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp('10%'), // Extra padding for keyboard
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('2%'),
    gap: wp('2%'), // Space between buttons
  },
  actionButton: {
    flex: 1, // Equal width
    paddingVertical: hp('2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp('6%'),
  },
  header: {
    fontSize: wp('5.5%'),
    fontWeight: '700',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  cartContainer: {
    marginBottom: hp('2.5%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#B45309',
    marginBottom: hp('1.5%'),
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp('1.2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: wp('3.8%'),
    fontWeight: '600',
    color: '#7C2D12',
  },
  addonContainer: {
    marginTop: hp('0.5%'),
  },
  addonText: {
    fontSize: wp('3.2%'),
    color: '#78350F',
    marginLeft: wp('2%'),
  },
  itemSubtotal: {
    fontSize: wp('3.2%'),
    fontWeight: '600',
    color: '#B91C1C',
    marginTop: hp('0.5%'),
  },
  itemQuantity: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#7C2D12',
  },
  emptyCartText: {
    fontSize: wp('4%'),
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: hp('1.5%'),
  },
  totalContainer: {
    marginBottom: hp('2.5%'),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: hp('0.8%'),
  },
  totalLabel: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#7C2D12',
    marginRight: wp('2%'),
  },
  totalValue: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#7C2D12',
  },
  amount: {
    fontSize: wp('6.5%'),
    fontWeight: '800',
    color: '#DC2626',
  },
  customerContainer: {
    marginBottom: hp('2.5%'),
  },
  customerText: {
    fontSize: wp('3.8%'),
    color: '#78350F',
    marginBottom: hp('0.5%'),
  },
  centered: {
    alignItems: 'center',
    marginBottom: hp('2%'),
    marginTop: hp('1%'),
  },
  subLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: hp('1%'),
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    padding: hp('1.5%'),
    fontSize: wp('4.5%'),
    textAlign: 'center',
    width: '100%',
    maxWidth: wp('80%'),
    borderWidth: 1,
    borderColor: '#FDE68A',
    elevation: 2,
  },
  suggestion: {
    fontSize: wp('3.8%'),
    color: '#6B7280',
    marginBottom: hp('1%'),
  },
  billsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: wp('2%'),
    marginBottom: hp('2%'),
  },
  billButton: {
    backgroundColor: '#FACC15',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('2%'),
    minWidth: wp('22%'),
    alignItems: 'center',
    margin: wp('1%'),
  },
  billText: {
    fontWeight: 'bold',
    fontSize: wp('3.8%'),
    color: '#78350F',
  },
  changeLabel: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#10B981',
  },
  exactButton: {
    backgroundColor: '#10B981',
  },
  exactButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: '700',
  },
  proceedButton: {
    backgroundColor: '#4F46E5',
  },
  proceedText: {
    color: 'white',
    fontSize: wp('4.2%'),
    fontWeight: '700',
  },
});