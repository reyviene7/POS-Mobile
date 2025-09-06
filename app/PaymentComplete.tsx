import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';

export default function PaymentComplete() {
  const router = useRouter();
  const { total, received, change, method, cart, customerName, customerNumber, customerAddress, notes, discount, deliveryFee, receiptNo: receivedReceiptNo } = useLocalSearchParams();
  const [receiptNo, setReceiptNo] = useState(receivedReceiptNo as string || '000001');
  const navigation = useNavigation();
  
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace('/Home');
        return true; // Prevent default back behavior
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      // Disable swipe back gesture
      navigation.setOptions?.({ 
        gestureEnabled: false,
        headerLeft: () => null // Remove default back button
      });

      return () => {
        backHandler.remove();
        // Reset navigation options when component unmounts
        navigation.setOptions?.({ 
          gestureEnabled: true,
          headerLeft: undefined 
        });
      };
    }, [router, navigation])
  );

  // Handle header back button
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // Remove default back button
    });
  }, [navigation]);

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
      pathname: '/Home',
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
    padding: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeText: {
    fontSize: wp('8%'),
    fontWeight: '800',
    color: '#16A34A',
    marginBottom: hp('4%'),
  },
  infoBox: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: wp('3%'),
    padding: wp('5%'),
    marginBottom: hp('3%'),
    elevation: 3,
  },
  label: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#374151',
  },
  amount: {
    fontSize: wp('6.2%'),
    fontWeight: '700',
    color: '#DC2626',
  },
  methodText: {
    fontSize: wp('3.8%'),
    color: '#6B7280',
    marginBottom: hp('2%'),
  },
  buttonsContainer: {
    width: '100%',
    gap: hp('1.5%'),
  },
  actionButton: {
    paddingVertical: hp('2%'),
    borderRadius: wp('2%'),
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
    fontSize: wp('4.2%'),
    fontWeight: '700',
  },
});