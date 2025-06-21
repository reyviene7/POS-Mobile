import * as MediaLibrary from 'expo-media-library';
import { printToFileAsync } from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useRef } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';

export default function ReceiptPrintScreen() {
  const { cart: cartString, total, received, change, method } = useLocalSearchParams();
  const cart = cartString ? JSON.parse(cartString) : [];
  const receiptRef = useRef(null);
  const router = useRouter();

  const saveAsImage = async () => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) return;

    const uri = await captureRef(receiptRef, { format: 'png', quality: 1 });
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('Saved', 'Receipt saved to gallery as image.');
  };

  const shareAsPDF = async () => {
    const html = generateHTMLReceipt();
    const { uri } = await printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const handlePrint = async () => {
    try {
      Alert.alert('Printing', 'Sending data to thermal printer...');
      // ThermalPrinterModule.printText('EggCited Receipt'); // Placeholder
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Printing failed.');
    }
  };

  const generateHTMLReceipt = () => {
    const rows = cart
      .map(
        (item) =>
          `<tr>
            <td>${item.product.name}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">₱${item.product.price.toFixed(2)}</td>
            <td style="text-align:right;">₱${(item.product.price * item.quantity).toFixed(2)}</td>
          </tr>`
      )
      .join('');

    return `
      <html>
      <body style="font-family:monospace;padding:10px;">
        <div style="text-align:center;">
          <h2>EggCited</h2>
          <p><em>At EggCited, we take the humble egg sandwich to the next level</em></p>
          <p>Receipt No: 00001</p>
        </div>
        <hr />
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
        <p>Item/s: ${cart.length}</p>
        <p>Date | Time: ${new Date().toLocaleString()}</p>
        <hr />
        <p style="text-align:right;"><strong>TOTAL: ₱${parseFloat(total).toFixed(2)}</strong></p>
        <p style="text-align:right;">PAYABLE: ₱${parseFloat(total).toFixed(2)}</p>
        <p style="text-align:right;">RECEIVED (${method}): ₱${parseFloat(received).toFixed(2)}</p>
        <p style="text-align:right;">CHANGE: ₱${parseFloat(change).toFixed(2)}</p>
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
        <Text style={styles.receiptNo}>Receipt No: 00001</Text>

        <View style={styles.divider} />

        <View style={styles.rowHeader}>
          <Text style={styles.itemCol}>ITEM</Text>
          <Text style={styles.qtyCol}>QTY</Text>
          <Text style={styles.priceCol}>PRICE</Text>
          <Text style={styles.subCol}>SUBTOTAL</Text>
        </View>

        {cart.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.itemCol}>{item.product.name}</Text>
            <Text style={styles.qtyCol}>{item.quantity}</Text>
            <Text style={styles.priceCol}>₱{item.product.price.toFixed(2)}</Text>
            <Text style={styles.subCol}>₱{(item.product.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.divider} />
        <Text style={styles.meta}>Item/s: {cart.length}</Text>
        <Text style={styles.meta}>Date | Time: {new Date().toLocaleString()}</Text>

        <View style={styles.divider} />
        <Text style={styles.total}>TOTAL: ₱{parseFloat(total).toFixed(2)}</Text>

        <Text style={styles.total}>AMOUNT PAYABLE: ₱{parseFloat(total).toFixed(2)}</Text>
        <Text style={styles.total}>RECEIVED ({method}): ₱{parseFloat(received).toFixed(2)}</Text>
        <Text style={styles.total}>CHANGE: ₱{parseFloat(change).toFixed(2)}</Text>

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
    padding: 16,
    backgroundColor: '#FFFDE7',
  },
  receipt: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 6,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  receiptNo: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    marginVertical: 8,
  },
  rowHeader: {
    flexDirection: 'row',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  itemCol: { flex: 2, fontSize: 12 },
  qtyCol: { flex: 1, fontSize: 12, textAlign: 'center' },
  priceCol: { flex: 1, fontSize: 12, textAlign: 'right' },
  subCol: { flex: 1, fontSize: 12, textAlign: 'right' },
  meta: {
    fontSize: 12,
    marginBottom: 2,
  },
  total: {
    fontSize: 13,
    textAlign: 'right',
    fontWeight: '600',
    marginBottom: 2,
  },
  footer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    color: '#6B7280',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
