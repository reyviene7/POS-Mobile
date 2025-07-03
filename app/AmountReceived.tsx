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
      // Reset receiptNo daily
      const orderIdRes = await api.get('/sales-history/order-ids');
      const existingOrderIds: string[] = orderIdRes.data;

      const numericParts = existingOrderIds
      .filter(id => /^SALE\d+$/.test(id))
      .map(id => parseInt(id.replace('SALE', ''), 10));
      const nextReceiptNumber = numericParts.length > 0 ? Math.max(...numericParts) + 1 : 1;
      const formattedReceiptNo = nextReceiptNumber.toString().padStart(3, '0');
      const orderId = `SALE${formattedReceiptNo}`;

      // Step 3: Build payload
      const orderDTO = {
        orderId,
        timestamp: new Date().toISOString(),
        total: parseFloat(payable.toFixed(2)),
        paymentMethodId: method === 'Cash' ? 1 : method === 'Credit' ? 2 : null,
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
          discount: parsedDiscount.toString(),
          deliveryFee: parsedDeliveryFee.toString(),
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView}>
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
                              {addon.addonName} x{qty} (₱{addon.price * qty})
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
              <Text style={styles.totalValue}>₱{subtotal.toFixed(2)}</Text>
            </View>
            {parsedDiscount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={styles.totalValue}>-₱{parsedDiscount.toFixed(2)}</Text>
              </View>
            )}
            {parsedDeliveryFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Delivery Fee:</Text>
                <Text style={styles.totalValue}>₱{parsedDeliveryFee.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>AMOUNT PAYABLE:</Text>
              <Text style={styles.amount}>₱{payable.toFixed(2)}</Text>
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
            <Text style={styles.changeLabel}>Change: ₱{change.toFixed(2)}</Text>
          </View>

          <TouchableOpacity style={styles.exactButton} onPress={handleExactAmount}>
            <Text style={styles.exactButtonText}>EXACT AMOUNT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
            <Text style={styles.proceedText}>PROCEED</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: 16,
  },
  cartContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B45309',
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C2D12',
  },
  addonContainer: {
    marginTop: 4,
  },
  addonText: {
    fontSize: 12,
    color: '#78350F',
    marginLeft: 8,
  },
  itemSubtotal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B91C1C',
    marginTop: 4,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C2D12',
  },
  emptyCartText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 12,
  },
  totalContainer: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C2D12',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C2D12',
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#DC2626',
  },
  customerContainer: {
    marginBottom: 20,
  },
  customerText: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 4,
  },
  centered: {
    alignItems: 'center',
    marginBottom: 16,
  },
  subLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    width: '80%',
    borderWidth: 1,
    borderColor: '#FDE68A',
    elevation: 2,
  },
  suggestion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  billsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  billButton: {
    backgroundColor: '#FACC15',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  billText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#78350F',
  },
  changeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  exactButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  exactButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  proceedButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  proceedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});