import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Item {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  timestamp: string;
  total: number;
  items: Item[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailsModal: React.FC<Props> = ({ visible, onClose, order }) => {
  if (!order) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.header}>🍳 Order Summary</Text>
          <Text style={styles.subHeader}>Order #{order.orderId}</Text>
          <Text style={styles.timestamp}>
            {new Date(order.timestamp).toLocaleString()}
          </Text>

          <ScrollView style={styles.itemsContainer}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemInfo}>
                  x{item.quantity} – ₱{item.price.toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>₱{order.total.toFixed(2)}</Text>
          </View>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
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
  },
  timestamp: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
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
  closeButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#4F46E5",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
