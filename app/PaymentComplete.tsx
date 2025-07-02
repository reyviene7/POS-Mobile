import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function PaymentComplete() {
  const router = useRouter();
  const { total, received, change, method, cart, customerName, customerNumber, customerAddress, notes, discount, deliveryFee, receiptNo: receivedReceiptNo } = useLocalSearchParams();
  const [receiptNo, setReceiptNo] = useState(receivedReceiptNo as string || '000001');

  useEffect(() => {
    Toast.show({
      type: 'success',
      text1: '🥪 Payment Successful!',
      text2: 'Transaction completed successfully!',
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 40,
    });

    const initializeReceiptNo = async () => {
      try {
        const stored = await AsyncStorage.getItem('receiptNo');
        if (stored) {
          const num = parseInt(stored, 10);
          setReceiptNo(num.toString().padStart(6, '0'));
          console.log('PaymentComplete: Loaded receiptNo from AsyncStorage:', num.toString().padStart(6, '0'));
        }
        // Increment receipt number for the next transaction
        const newNum = stored ? parseInt(stored, 10) + 1 : 2;
        await AsyncStorage.setItem('receiptNo', newNum.toString());
        console.log('PaymentComplete: Incremented receiptNo to:', newNum.toString().padStart(6, '0'));
      } catch (error) {
        console.error('Failed to manage receipt number:', error);
      }
    };
    initializeReceiptNo();
  }, []);

  const handleNewEntry = async () => {
    try {
      await AsyncStorage.removeItem('cart');
      console.log('Cart cleared in AsyncStorage');
      router.replace({
        pathname: '/PointOfSales',
        params: {},
      });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      router.replace({
        pathname: '/PointOfSales',
        params: {},
      });
    }
  };

  const handleBackToHome = () => {
    router.replace({
      pathname: '/',
      params: {},
    });
  };

  const handleOpenDrawer = () => {
    Toast.show({
      type: 'success',
      text1: '🥪 Payment Successful!',
      text2: 'Cash Drawer Opened',
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 40,
    });
  };

  const handlePrintReceipt = () => {
    router.push({
      pathname: '/ReceiptPrint',
      params: {
        cart: cart || '',
        customerName: customerName || '',
        customerNumber: customerNumber || '',
        customerAddress: customerAddress || '',
        notes: notes || '',
        discount: discount || '0',
        deliveryFee: deliveryFee || '0',
        total: total || '0',
        received: received || '0',
        method: method || '',
        change: change || '0',
        receiptNo,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.completeText}>COMPLETED</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>PAYABLE</Text>
        <Text style={styles.amount}>₱{total}</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>AMOUNT RECEIVED</Text>
        <Text style={styles.amount}>₱{received}</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>CHANGE</Text>
        <Text style={[styles.amount, { color: '#10B981' }]}>₱{change}</Text>
      </View>

      <Text style={styles.methodText}>Payment Method: {method}</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.drawer]} onPress={handleOpenDrawer}>
          <Text style={styles.buttonText}>OPEN CASH DRAWER</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.print]} onPress={handlePrintReceipt}>
          <Text style={styles.buttonText}>RECEIPT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.new]} onPress={handleNewEntry}>
          <Text style={styles.buttonText}>NEW ENTRY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.home]} onPress={handleBackToHome}>
          <Text style={styles.buttonText}>BACK TO HOME</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#16A34A',
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
  },
  methodText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  drawer: {
    backgroundColor: '#F59E0B',
  },
  print: {
    backgroundColor: '#3B82F6',
  },
  new: {
    backgroundColor: '#4F46E5',
  },
  home: {
    backgroundColor: '#14B8A6',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});