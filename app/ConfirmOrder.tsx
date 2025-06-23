import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ConfirmOrder() {
  const router = useRouter();
  const { cart: cartString } = useLocalSearchParams(); // Get query params
  const cart = cartString ? JSON.parse(cartString) : []; // Parse the cart or default to empty array

  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let grandTotal = 0;

    // Ensure cart is an array before using forEach
    if (Array.isArray(cart)) {
      cart.forEach(item => {
        const productCost = item.product.price * item.quantity;
        const addonCost = Object.entries(item.addons).reduce((sum, [_, qty]) => {
          return sum + qty * 5; // Assume ₱5 per add-on piece
        }, 0);
        subtotal += productCost + addonCost;
      });
    }

    grandTotal = subtotal; // No additional fees for simplicity; adjust if needed
    return { subtotal, grandTotal };
  };

  const { subtotal, grandTotal } = calculateTotals();

  const handleConfirm = () => {
    router.push({
      pathname: '/PaymentOption',
    });
  };

  const handleAdjustQuantity = (index, change) => {
    if (!Array.isArray(cart)) return;
    const newCart = [...cart];
    const newQuantity = Math.max(1, newCart[index].quantity + change);
    newCart[index].quantity = newQuantity;
    // Update the cart in the URL or global state if needed
    router.replace({
      pathname: '/ConfirmOrder',
      query: { cart: JSON.stringify(newCart) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.storeName}>EggCited</Text>
          <Text style={styles.receiptNo}>Receipt No. 000008</Text>
        </View>

        <View style={styles.productRow}>
          <Text style={styles.productHeader}>Product</Text>
          <Text style={styles.productHeader}>Qty</Text>
          <Text style={styles.productHeader}>Price</Text>
          <Text style={styles.productHeader}>Subtotal</Text>
        </View>

        {Array.isArray(cart) && cart.length > 0 ? (
          cart.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <Text style={styles.productName}>{item.product.name}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleAdjustQuantity(index, -1)}>
                  <Text style={styles.quantityText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleAdjustQuantity(index, 1)}>
                  <Text style={styles.quantityText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.productPrice}>₱{item.product.price.toFixed(2)}</Text>
              <Text style={styles.subtotal}>
                ₱{(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyCartText}>No items in cart</Text>
        )}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>GRAND TOTAL:</Text>
          <Text style={styles.totalValue}>₱{grandTotal.toFixed(2)}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Add Items</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Scan Items</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Discount</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Service Fee</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Delivery Fee</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.detailsToggle}>
          <Text style={styles.detailsToggleText}>Customer's Details and Notes</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED', // Light warm eggy background
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
  storeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D97706', // Golden yellow-orange
  },
  receiptNo: {
    fontSize: 14,
    color: '#A16207',
    fontWeight: '500',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7', // Soft yellow
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  productHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78350F',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: '#7C2D12',
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 6,
    backgroundColor: '#F59E0B', // Sunny yellow
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
  },
  subtotal: {
    fontSize: 14,
    color: '#B91C1C',
    fontWeight: '600',
  },
  emptyCartText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
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
    backgroundColor: '#EF4444', // Soft red
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
});
