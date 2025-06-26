import React from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  onDelete?: (orderId: string) => void; // Make onDelete optional
}

const OrderDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  orderId,
  items,
  totalPrice,
  timestamp,
  paymentMethod,
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
                  x{item.quantity} – ₱{item.price.toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>₱{totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.buttonContainer}>
            {onDelete && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    "Delete Order",
                    `Are you sure you want to delete Order #${orderId}?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => onDelete(orderId) },
                    ]
                  );
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
    padding: 20,
  },
  modal: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
    elevation: 6,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#B45309",
    textAlign: "center",
    marginBottom: 6,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    textAlign: "center",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  paymentMethod: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  itemsContainer: {
    marginBottom: 12,
    maxHeight: 220,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  itemInfo: {
    fontSize: 14,
    color: "#6B7280",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
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
    fontSize: 14,
    textAlign: "center",
  },
});