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
    // Handle confirmation logic (e.g., save order, navigate back)
    router.back();
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
    backgroundColor: '#EEF2FF', // Match PointOfSales background
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937', // Match dark text
  },
  receiptNo: {
    fontSize: 14,
    color: '#6B7280', // Match secondary text
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E5E7EB', // Match secondary background
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  productHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151', // Slightly lighter text for headers
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Match secondary background
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937', // Match dark text
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 5,
    backgroundColor: '#4F46E5', // Match primary button color
    borderRadius: 4,
  },
  quantityText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  quantityValue: {
    fontSize: 14,
    color: '#1F2937', // Match dark text
    marginHorizontal: 8,
  },
  productPrice: {
    fontSize: 14,
    color: '#1F2937', // Match dark text
  },
  subtotal: {
    fontSize: 14,
    color: '#EF4444', // Match accent color for subtotal
  },
  emptyCartText: {
    fontSize: 14,
    color: '#6B7280', // Match secondary text
    textAlign: 'center',
    marginVertical: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937', // Match dark text
    marginRight: 10,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937', // Match dark text
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  actionButton: {
    backgroundColor: '#4F46E5', // Match primary button color
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#4F46E5', // Match primary button color
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  detailsToggleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    color: '#1F2937', // Match dark text
    elevation: 2,
  },
  confirmButton: {
    backgroundColor: '#4F46E5', // Match primary button color (replacing pink)
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});