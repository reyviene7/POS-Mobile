import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProductsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧙 Products Management</Text>
      <Text style={styles.subtitle}>Add or manage your products below</Text>

      <View style={styles.grid}>
        <Link href="/add-product" asChild>
          <TouchableOpacity style={[styles.button, styles.yellow]}>
            <Text style={styles.buttonIcon}>➕</Text>
            <Text style={styles.buttonText}>Add Product</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/product-list" asChild>
          <TouchableOpacity style={[styles.button, styles.blue]}>
            <Text style={styles.buttonIcon}>📦</Text>
            <Text style={styles.buttonText}>All Products</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4338CA',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  button: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  yellow: {
    backgroundColor: '#FDE68A',
  },
  blue: {
    backgroundColor: '#93C5FD',
  },
  buttonIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});
