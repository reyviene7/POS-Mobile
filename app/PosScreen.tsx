import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Example product list, replace with your inventory data source as needed
const products = [
  { id: '1', name: 'Product A' },
  { id: '2', name: 'Product B' },
  { id: '3', name: 'Product C' },
  { id: '4', name: 'Product D' },
  { id: '5', name: 'Product E' },
];

export default function PosScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {products.map((product) => (
        <TouchableOpacity key={product.id} style={styles.button}>
          <Text style={styles.buttonText}>{product.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#C6F68D',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 60,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#222',
    fontSize: 20,
    fontWeight: '500',
  },
});