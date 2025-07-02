import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

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

export default function ConfirmOrder() {
  const router = useRouter();
  const navigation = useNavigation();
  const { cart: cartString } = useLocalSearchParams();
  const [cart, setCart] = useState<CartItem[]>(
    cartString
      ? JSON.parse(Array.isArray(cartString) ? cartString[0] : cartString)
      : []
  );
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showDeliveryFeeModal, setShowDeliveryFeeModal] = useState(false);
  const [tempDiscount, setTempDiscount] = useState('');
  const [tempDeliveryFee, setTempDeliveryFee] = useState('');
  const [receiptNo, setReceiptNo] = useState('000001');

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load receipt number
        const storedReceiptNo = await AsyncStorage.getItem('receiptNo');
        if (storedReceiptNo) {
          const num = parseInt(storedReceiptNo, 10);
          setReceiptNo(num.toString().padStart(6, '0'));
        } else {
          await AsyncStorage.setItem('receiptNo', '1');
          setReceiptNo('000001');
        }

        // Update cart state if cartString changes
        if (cartString) {
          const parsedCart = JSON.parse(
            Array.isArray(cartString) ? cartString[0] : cartString
          );
          setCart(parsedCart);
          console.log('ConfirmOrder: Cart updated from cartString:', parsedCart);
        } else {
          setCart([]);
          console.log('ConfirmOrder: Cart set to [] (no cartString)');
        }

        const storedCart = await AsyncStorage.getItem('cart');
        console.log('ConfirmOrder: AsyncStorage cart:', storedCart);
      } catch (error) {
        console.error('Failed to initialize ConfirmOrder:', error);
        setCart([]);
      }
    };
    initialize();
  }, [cartString]);

  // Override back button behavior
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={async () => {
            try {
              await AsyncStorage.setItem('cart', JSON.stringify(cart));
              console.log('ConfirmOrder: Cart saved for back navigation:', cart);
              router.replace({
                pathname: '/PointOfSales',
                params: { cart: JSON.stringify(cart) },
              });
            } catch (error) {
              console.error('Failed to save cart to AsyncStorage:', error);
              router.replace({
                pathname: '/PointOfSales',
                params: { cart: JSON.stringify(cart) },
              });
            }
          }}
          style={styles.headerLeftButton}
        >
        <Ionicons name="arrow-back-outline" size={22} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, cart]);

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

    const grandTotal = subtotal - discount + deliveryFee;
    return { subtotal, grandTotal };
  };

  const { subtotal, grandTotal } = calculateTotals();

  const handleAdjustQuantity = async (index: number, change: number) => {
    if (!Array.isArray(cart)) return;
    const newCart = [...cart];
    const newQuantity = newCart[index].quantity + change;

    if (newQuantity <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].quantity = newQuantity;
    }

    setCart(newCart);
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
      console.log('ConfirmOrder: Cart updated in AsyncStorage:', newCart);
    } catch (error) {
      console.error('Failed to save cart to AsyncStorage:', error);
    }
    router.replace({
      pathname: '/ConfirmOrder',
      params: { cart: JSON.stringify(newCart) },
    });
  };

  const handleConfirm = () => {
    router.push({
      pathname: '/PaymentOption',
      params: {
        cart: JSON.stringify(cart),
        customerName,
        customerNumber,
        customerAddress,
        notes,
        discount: discount.toString(),
        deliveryFee: deliveryFee.toString(),
        receiptNo,
      },
    });
  };

  const handleAddItems = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      console.log('ConfirmOrder: Cart saved for Add Items:', cart);
    } catch (error) {
      console.error('Failed to save cart to AsyncStorage:', error);
    }
    router.push({
      pathname: '/PointOfSales',
      params: { cart: JSON.stringify(cart) },
    });
  };

  const handleApplyDiscount = () => {
    const value = parseFloat(tempDiscount) || 0;
    if (value < 0) {
      Toast.show({
        type: 'error',
        text1: '💵 Invalid Discount',
        text2: 'Discount cannot be negative.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    setDiscount(value);
    setShowDiscountModal(false);
    setTempDiscount('');
  };

  const handleApplyDeliveryFee = () => {
    const value = parseFloat(tempDeliveryFee) || 0;
    if (value < 0) {
      Toast.show({
        type: 'error',
        text1: '🚚 Invalid Delivery Fee',
        text2: 'Delivery fee cannot be negative.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    setDeliveryFee(value);
    setShowDeliveryFeeModal(false);
    setTempDeliveryFee('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.storeName}>EggCited</Text>
          <Text style={styles.receiptNo}>Receipt No. {receiptNo}</Text>
        </View>

        <View style={styles.productRow}>
          <Text style={styles.productHeader}>Product</Text>
          <Text style={styles.productHeader}>Qty</Text>
          <Text style={styles.productHeader}>Price</Text>
          <Text style={styles.productHeader}>Subtotal</Text>
        </View>

        {Array.isArray(cart) && cart.length > 0 ? (
          cart.map((item, index) => (
            <View
              key={`${item.product.productId}-${item.product.size || ''}-${item.product.flavorName || ''}`}
              style={styles.productItem}
            >
              <View style={styles.productNameContainer}>
                <Text style={styles.productName}>
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
              </View>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleAdjustQuantity(index, -1)}
                >
                  <Text style={styles.quantityText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleAdjustQuantity(index, 1)}
                >
                  <Text style={styles.quantityText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.productPrice}>₱{item.product.price.toFixed(2)}</Text>
              <Text style={styles.subtotal}>
                ₱{(
                  item.product.price * item.quantity +
                  Object.entries(item.addons).reduce((sum, [addonId, qty]) => {
                    const addon = item.addonDetails?.find((a) => a.addonId === Number(addonId));
                    return sum + (addon ? addon.price * qty : 0);
                  }, 0)
                ).toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyCartText}>No items in cart</Text>
        )}

        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>₱{subtotal.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-₱{discount.toFixed(2)}</Text>
            </View>
          )}
          {deliveryFee > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery Fee:</Text>
              <Text style={styles.totalValue}>₱{deliveryFee.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GRAND TOTAL:</Text>
            <Text style={styles.totalValue}>₱{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddItems}>
            <Text style={styles.actionButtonText}>Add Items</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowDiscountModal(true)}>
            <Text style={styles.actionButtonText}>Discount</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowDeliveryFeeModal(true)}>
            <Text style={styles.actionButtonText}>Delivery Fee</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.detailsToggle}>
          <Text style={styles.detailsToggleText}>Customer&apos;s Details and Notes (Optional)</Text>
          <Text style={styles.detailsToggleArrow}>▼</Text>
        </TouchableOpacity>

        <View style={styles.detailsContainer}>
          <TextInput
            style={styles.input}
            placeholder="Customer's name"
            value={customerName}
            onChangeText={setCustomerName}
          />
          <TextInput
            style={styles.input}
            placeholder="Customer's number"
            value={customerNumber}
            onChangeText={setCustomerNumber}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Customer's address"
            value={customerAddress}
            onChangeText={setCustomerAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>CONFIRM</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Discount Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDiscountModal}
        onRequestClose={() => setShowDiscountModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Discount</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter discount amount (₱)"
              value={tempDiscount}
              onChangeText={setTempDiscount}
              keyboardType="numeric"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDiscountModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={handleApplyDiscount}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delivery Fee Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDeliveryFeeModal}
        onRequestClose={() => setShowDeliveryFeeModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Delivery Fee</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter delivery fee (₱)"
              value={tempDeliveryFee}
              onChangeText={setTempDeliveryFee}
              keyboardType="numeric"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeliveryFeeModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={handleApplyDeliveryFee}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  headerLeftButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#431407',
  },
  storeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D97706',
  },
  receiptNo: {
    fontSize: 14,
    color: '#A16207',
    fontWeight: '500',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  productHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78350F',
    flex: 1,
    textAlign: 'center',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  productNameContainer: {
    flex: 1,
    paddingRight: 8,
  },
  productName: {
    fontSize: 14,
    color: '#7C2D12',
    fontWeight: '600',
  },
  addonContainer: {
    marginTop: 4,
  },
  addonText: {
    fontSize: 12,
    color: '#78350F',
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  quantityButton: {
    padding: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  quantityValue: {
    fontSize: 14,
    color: '#7C2D12',
    marginHorizontal: 8,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 14,
    color: '#78350F',
    flex: 1,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 14,
    color: '#B91C1C',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  emptyCartText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 12,
  },
  totalContainer: {
    marginTop: 10,
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
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#FCD34D',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexGrow: 1,
    marginHorizontal: 2,
    elevation: 2,
  },
  actionButtonText: {
    color: '#78350F',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F59E0B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailsToggleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  detailsToggleArrow: {
    color: 'white',
    fontSize: 14,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 12,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  confirmButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },
  confirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#F59E0B',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});