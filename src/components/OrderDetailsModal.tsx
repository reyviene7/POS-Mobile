// components/OrderDetailsModal.tsx

import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
          <Text style={styles.header}>Order Details</Text>
          <Text style={styles.subHeader}>Order ID: {order.orderId}</Text>
          <Text style={styles.timestamp}>
            {new Date(order.timestamp).toLocaleString()}
          </Text>

          <ScrollView style={styles.itemsContainer}>
            {order.items.map((item, index) => (
              <Text key={index} style={styles.item}>
                {item.name} x{item.quantity} - ₱{item.price}
              </Text>
            ))}
          </ScrollView>

          <Text style={styles.total}>Total: ₱{order.total}</Text>

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
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "500",
  },
  timestamp: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  itemsContainer: {
    marginBottom: 12,
    maxHeight: 200,
  },
  item: {
    fontSize: 14,
    marginBottom: 4,
    color: "#374151",
  },
  total: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
    color: "#10B981",
  },
  closeButton: {
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#3B82F6",
    borderRadius: 6,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
