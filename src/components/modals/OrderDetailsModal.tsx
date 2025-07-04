import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface Item {
  productName: string;
  quantity: number;
  price: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  orderId: string | null;
  items: Item[];
  totalPrice: number;
  timestamp: string;
  paymentMethod: string | null;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
  onDelete?: (orderId: string) => void;
}

const OrderDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  orderId,
  items,
  totalPrice,
  timestamp,
  paymentMethod,
  discount,
  deliveryFee,
  grandTotal,
  onDelete,
}) => {
  if (!visible || !orderId) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.header}>🍳 Order Details</Text>
          <Text style={styles.subHeader}>Order ID: #{orderId}</Text>
          <Text style={styles.timestamp}>
            Timestamp: {new Date(timestamp).toLocaleString()}
          </Text>
          <Text style={styles.paymentMethod}>
            Payment: {paymentMethod || "None"}
          </Text>
          <ScrollView style={styles.itemsContainer}>
            {items.map((item, index) => (
              <View key={`${orderId}-${item.productName}`} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemInfo}>
                  x{item.quantity} – ₱{(item.price || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalAmount}>₱{(totalPrice || 0).toFixed(2)}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={styles.totalAmount}>-₱{(discount || 0).toFixed(2)}</Text>
              </View>
            )}
            {deliveryFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Delivery Fee:</Text>
                <Text style={styles.totalAmount}>₱{(deliveryFee || 0).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total:</Text>
              <Text style={styles.totalAmount}>₱{(grandTotal || 0).toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            {onDelete && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => {
                  onDelete(orderId);
                  Toast.show({
                    type: 'success',
                    text1: '🗑️ Order Deleted',
                    text2: `Order #${orderId} has been deleted.`,
                    position: 'top',
                    visibilityTime: 3000,
                    autoHide: true,
                    topOffset: 40,
                  });
                }}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default OrderDetailsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: wp('5%'),
  },
  modal: {
    backgroundColor: "#FFFBEB",
    borderRadius: wp('4%'),
    padding: wp('5%'),
    maxHeight: hp('80%'),
    elevation: 6,
  },
  header: {
    fontSize: wp('6%'),
    fontWeight: "bold",
    color: "#B45309",
    textAlign: "center",
    marginBottom: hp('1.5%'),
  },
  subHeader: {
    fontSize: wp('4.5%'),
    fontWeight: "600",
    color: "#92400E",
    textAlign: "center",
    marginBottom: hp('1%'),
  },
  timestamp: {
    fontSize: wp('3.8%'),
    color: "#6B7280",
    textAlign: "center",
    marginBottom: hp('1%'),
  },
  paymentMethod: {
    fontSize: wp('3.8%'),
    color: "#374151",
    textAlign: "center",
    marginBottom: hp('1.5%'),
  },
  itemsContainer: {
    marginBottom: hp('2%'),
    maxHeight: hp('30%'),
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp('1%'),
  },
  itemName: {
    fontSize: wp('3.8%'),
    color: "#374151",
    fontWeight: "500",
  },
  itemInfo: {
    fontSize: wp('3.8%'),
    color: "#6B7280",
  },
  totalContainer: {
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: hp('1.5%'),
    marginTop: hp('1%'),
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp('0.8%'),
  },
  totalLabel: {
    fontSize: wp('4.2%'),
    fontWeight: "600",
    color: "#1F2937",
  },
  totalAmount: {
    fontSize: wp('4.2%'),
    fontWeight: "700",
    color: "#10B981",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp('2%'),
    marginTop: hp('1.5%'),
  },
  button: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('2%'),
  },
  closeButton: {
    backgroundColor: "#4F46E5",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: wp('3.8%'),
    textAlign: "center",
  },
});