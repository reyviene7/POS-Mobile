import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

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

export default function PaymentOption() {
  const router = useRouter();
  const {
    cart: cartString,
    customerName,
    customerNumber,
    customerAddress,
    notes,
    discount,
    deliveryFee,
  } = useLocalSearchParams();

  const cart: CartItem[] = cartString ? JSON.parse(cartString as string) : [];
  const parsedDiscount = parseFloat(discount as string || '0') || 0;
  const parsedDeliveryFee = parseFloat(deliveryFee as string || '0') || 0;

  const calculateTotals = () => {
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

    const grandTotal = subtotal - parsedDiscount + parsedDeliveryFee;
    return { subtotal, grandTotal };
  };

  const { subtotal, grandTotal } = calculateTotals();

  const handleSelectPayment = (method: string) => {
    router.push({
      pathname: '/AmountReceived',
      params: {
        cart: JSON.stringify(cart),
        customerName: customerName || '',
        customerNumber: customerNumber || '',
        customerAddress: customerAddress || '',
        notes: notes || '',
        discount: parsedDiscount.toString(),
        deliveryFee: parsedDeliveryFee.toString(),
        total: grandTotal.toFixed(2),
        method,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.amount}>₱{grandTotal.toFixed(2)}</Text>
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

        {/* Payment Options */}
        <Text style={styles.subLabel}>Choose payment option</Text>
        <TouchableOpacity style={styles.option} onPress={() => handleSelectPayment('Cash')}>
          <Text style={styles.optionText}>💵 Cash</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => handleSelectPayment('Credit')}>
          <Text style={styles.optionText}>💳 Credit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => handleSelectPayment('GCash')}>
          <Text style={styles.optionText}>📱 GCash</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
  },
  scrollView: {
    flex: 1,
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
    marginTop: hp('0.8%'),
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
  subLabel: {
    textAlign: 'center',
    fontSize: wp('4.2%'),
    fontWeight: '500',
    color: '#B45309',
    marginBottom: hp('1.5%'),
  },
  option: {
    backgroundColor: '#FACC15',
    padding: hp('2.2%'),
    marginVertical: hp('1%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
  },
  optionText: {
    fontSize: wp('4.8%'),
    fontWeight: '700',
    color: '#78350F',
  },
});