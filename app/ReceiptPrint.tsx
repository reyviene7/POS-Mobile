import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { printToFileAsync } from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import { captureRef } from 'react-native-view-shot';

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

export default function ReceiptPrint() {
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
    received,
    method,
    change,
    receiptNo: receivedReceiptNo,
  } = useLocalSearchParams();
  const [receiptNo, setReceiptNo] = useState(receivedReceiptNo as string || '000001');
  const cart: CartItem[] = cartString ? JSON.parse(cartString as string) : [];
  const parsedDiscount = parseFloat(discount as string || '0') || 0;
  const parsedDeliveryFee = parseFloat(deliveryFee as string || '0') || 0;
  const receiptRef = useRef(null);

  useEffect(() => {
    const loadReceiptNo = async () => {
      try {
        const stored = await AsyncStorage.getItem('receiptNo');
        if (stored) {
          const num = parseInt(stored, 10);
          // Use the stored receiptNo minus 1 (since PaymentComplete increments it)
          const currentReceiptNo = (num - 1).toString().padStart(6, '0');
          setReceiptNo(currentReceiptNo);
          console.log('ReceiptPrint: Loaded receiptNo from AsyncStorage:', currentReceiptNo);
        }
      } catch (error) {
        console.error('Failed to load receipt number:', error);
      }
    };
    if (!receivedReceiptNo || receivedReceiptNo === '000001') {
      loadReceiptNo();
    }
  }, [receivedReceiptNo]);

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
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const saveAsImage = async () => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      Toast.show({
        type: 'error',
        text1: '🖼️ Permission Denied',
        text2: 'Storage permission is required to save the receipt.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }

    try {
      const uri = await captureRef(receiptRef, { format: 'png', quality: 1 });
      await MediaLibrary.saveToLibraryAsync(uri);
      Toast.show({
        type: 'success',
        text1: '🖼️ Receipt Saved!',
        text2: 'Receipt saved to gallery as image.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: '🖼️ Save Failed',
        text2: 'Failed to save receipt as image.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    }
  };

  const shareAsPDF = async () => {
    try {
      const html = generateHTMLReceipt();
      const { uri } = await printToFileAsync({ html });
      await Sharing.shareAsync(uri);
      Toast.show({
        type: 'success',
        text1: '📄 PDF Shared!',
        text2: 'Receipt shared as PDF successfully.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: '📄 PDF Error',
        text2: 'Failed to generate or share PDF.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    }
  };

  const handlePrint = async () => {
    try {
      Toast.show({
        type: 'info',
        text1: '🖨️ Printing Receipt',
        text2: 'Sending data to thermal printer...',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      // ThermalPrinterModule.printText(generateHTMLReceipt()); // Placeholder for actual printer integration
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: '🖨️ Print Failed',
        text2: 'Printing failed.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    }
  };

  const generateHTMLReceipt = () => {
    const rows = cart
      .map(
        (item) => {
          const productRow = `
            <tr>
              <td>${item.product.productName}${item.product.size ? ` (${item.product.size})` : ''}${
                item.product.flavorName ? ` - ${item.product.flavorName}` : ''
              }</td>
              <td style="text-align:center;">${item.quantity}</td>
              <td style="text-align:right;">₱${item.product.price.toFixed(2)}</td>
              <td style="text-align:right;">₱${(item.product.price * item.quantity).toFixed(2)}</td>
            </tr>`;
          const addonRows = Object.entries(item.addons)
            .map(([addonId, qty]) => {
              const addon = item.addonDetails?.find((a) => a.addonId === Number(addonId));
              return addon
                ? `
                  <tr>
                    <td>  ${addon.addonName}</td>
                    <td style="text-align:center;">${qty}</td>
                    <td style="text-align:right;">₱${addon.price.toFixed(2)}</td>
                    <td style="text-align:right;">₱${(addon.price * qty).toFixed(2)}</td>
                  </tr>`
                : '';
            })
            .join('');
          return productRow + addonRows;
        }
      )
      .join('');

    const customerDetails = (customerName || customerNumber || customerAddress || notes)
      ? `
        <div style="margin-bottom:10px;">
          <p><strong>Customer Details:</strong></p>
          ${customerName ? `<p>Name: ${customerName}</p>` : ''}
          ${customerNumber ? `<p>Number: ${customerNumber}</p>` : ''}
          ${customerAddress ? `<p>Address: ${customerAddress}</p>` : ''}
          ${notes ? `<p>Notes: ${notes}</p>` : ''}
        </div>
        <hr />`
      : '';

    return `
      <html>
      <body style="font-family:monospace;padding:10px;">
        <div style="text-align:center;">
          <h2>EggCited</h2>
          <p><em>At EggCited, we take the humble egg sandwich to the next level</em></p>
          <p>Receipt No: ${receiptNo}</p>
        </div>
        <hr />
        ${customerDetails}
        <table style="width:100%;font-size:12px;">
          <tr>
            <th align="left">ITEM</th>
            <th align="center">QTY</th>
            <th align="right">PRICE</th>
            <th align="right">SUBTOTAL</th>
          </tr>
          ${rows}
        </table>
        <hr />
        <p>Item/s: ${itemCount}</p>
        <p>Date | Time: ${new Date().toLocaleString()}</p>
        <hr />
        <div style="text-align:right;">
          <p>Subtotal: ₱${subtotal.toFixed(2)}</p>
          ${parsedDiscount > 0 ? `<p>Discount: -₱${parsedDiscount.toFixed(2)}</p>` : ''}
          ${parsedDeliveryFee > 0 ? `<p>Delivery Fee: ₱${parsedDeliveryFee.toFixed(2)}</p>` : ''}
          <p><strong>TOTAL: ₱${parseFloat(total as string).toFixed(2)}</strong></p>
          <p>PAYABLE: ₱${parseFloat(total as string).toFixed(2)}</p>
          <p>RECEIVED (${method}): ₱${parseFloat(received as string).toFixed(2)}</p>
          <p>CHANGE: ₱${parseFloat(change as string).toFixed(2)}</p>
        </div>
        <hr />
        <p style="text-align:center;font-size:11px;">THIS IS NOT AN OFFICIAL RECEIPT</p>
        <p style="text-align:center;font-size:11px;">Please Ask For A Cash Sales Invoice</p>
      </body>
      </html>
    `;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View ref={receiptRef} collapsable={false} style={styles.receipt}>
        <Text style={styles.storeName}>EggCited</Text>
        <Text style={styles.tagline}>At EggCited, we take the humble egg sandwich to the next level</Text>
        <Text style={styles.receiptNo}>Receipt No: {receiptNo}</Text>

        {(customerName || customerNumber || customerAddress || notes) && (
          <View style={styles.customerContainer}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            {customerName && <Text style={styles.customerText}>Name: {customerName}</Text>}
            {customerNumber && <Text style={styles.customerText}>Number: {customerNumber}</Text>}
            {customerAddress && <Text style={styles.customerText}>Address: {customerAddress}</Text>}
            {notes && <Text style={styles.customerText}>Notes: {notes}</Text>}
            <View style={styles.divider} />
          </View>
        )}

        <View style={styles.rowHeader}>
          <Text style={styles.itemCol}>ITEM</Text>
          <Text style={styles.qtyCol}>QTY</Text>
          <Text style={styles.priceCol}>PRICE</Text>
          <Text style={styles.subCol}>SUBTOTAL</Text>
        </View>

        {cart.map((item: CartItem, index: number) => (
          <View key={index}>
            <View style={styles.row}>
              <Text style={styles.itemCol}>
                {item.product.productName}
                {item.product.size ? ` (${item.product.size})` : ''}
                {item.product.flavorName ? ` - ${item.product.flavorName}` : ''}
              </Text>
              <Text style={styles.qtyCol}>{item.quantity}</Text>
              <Text style={styles.priceCol}>₱{item.product.price.toFixed(2)}</Text>
              <Text style={styles.subCol}>₱{(item.product.price * item.quantity).toFixed(2)}</Text>
            </View>
            {Object.entries(item.addons).map(([addonId, qty]) => {
              const addon = item.addonDetails?.find((a) => a.addonId === Number(addonId));
              return addon ? (
                <View key={addonId} style={styles.row}>
                  <Text style={[styles.itemCol, styles.addonText]}>  {addon.addonName}</Text>
                  <Text style={styles.qtyCol}>{qty}</Text>
                  <Text style={styles.priceCol}>₱{addon.price.toFixed(2)}</Text>
                  <Text style={styles.subCol}>₱{(addon.price * qty).toFixed(2)}</Text>
                </View>
              ) : null;
            })}
          </View>
        ))}

        <View style={styles.divider} />
        <Text style={styles.meta}>Item/s: {itemCount}</Text>
        <Text style={styles.meta}>Date | Time: {new Date().toLocaleString()}</Text>

        <View style={styles.divider} />
        <View style={styles.totalContainer}>
          <Text style={styles.total}>Subtotal: ₱{subtotal.toFixed(2)}</Text>
          {parsedDiscount > 0 && <Text style={styles.total}>Discount: -₱{parsedDiscount.toFixed(2)}</Text>}
          {parsedDeliveryFee > 0 && <Text style={styles.total}>Delivery Fee: ₱{parsedDeliveryFee.toFixed(2)}</Text>}
          <Text style={styles.total}>TOTAL: ₱{parseFloat(total as string).toFixed(2)}</Text>
          <Text style={styles.total}>AMOUNT PAYABLE: ₱{parseFloat(total as string).toFixed(2)}</Text>
          <Text style={styles.total}>RECEIVED ({method}): ₱{parseFloat(received as string).toFixed(2)}</Text>
          <Text style={styles.total}>CHANGE: ₱{parseFloat(change as string).toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />
        <Text style={styles.footer}>THIS IS NOT AN OFFICIAL RECEIPT</Text>
        <Text style={styles.footer}>Please Ask For A Cash Sales Invoice</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={saveAsImage}>
        <Text style={styles.buttonText}>🖼️ Save as Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={shareAsPDF}>
        <Text style={styles.buttonText}>📄 Share as PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handlePrint}>
        <Text style={styles.buttonText}>🖨️ Print Receipt</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: wp('4%'),
    backgroundColor: '#FFFDE7',
  },
  receipt: {
    backgroundColor: '#ffffff',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    elevation: 2,
  },
  storeName: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tagline: {
    fontSize: wp('3.2%'),
    textAlign: 'center',
    marginTop: hp('0.5%'),
    marginBottom: hp('1%'),
    fontStyle: 'italic',
    color: '#6B7280',
  },
  receiptNo: {
    fontSize: wp('3.5%'),
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  customerContainer: {
    marginBottom: hp('1%'),
  },
  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#B45309',
    marginBottom: hp('0.5%'),
  },
  customerText: {
    fontSize: wp('3.5%'),
    color: '#78350F',
    marginBottom: hp('0.5%'),
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    marginVertical: hp('1.2%'),
  },
  rowHeader: {
    flexDirection: 'row',
    fontWeight: 'bold',
    marginBottom: hp('0.8%'),
  },
  row: {
    flexDirection: 'row',
    marginBottom: hp('0.8%'),
  },
  itemCol: { flex: 2, fontSize: wp('3.2%') },
  qtyCol: { flex: 1, fontSize: wp('3.2%'), textAlign: 'center' },
  priceCol: { flex: 1, fontSize: wp('3.2%'), textAlign: 'right' },
  subCol: { flex: 1, fontSize: wp('3.2%'), textAlign: 'right' },
  addonText: {
    paddingLeft: wp('2%'),
  },
  meta: {
    fontSize: wp('3.2%'),
    marginBottom: hp('0.5%'),
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  total: {
    fontSize: wp('3.5%'),
    textAlign: 'right',
    fontWeight: '600',
    marginBottom: hp('0.5%'),
  },
  footer: {
    fontSize: wp('3%'),
    textAlign: 'center',
    marginTop: hp('0.5%'),
    color: '#6B7280',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: hp('1.8%'),
    marginTop: hp('1.5%'),
    borderRadius: wp('2.2%'),
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: wp('3.8%'),
  },
});