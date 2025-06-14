import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Products() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧙 Products Management</Text>
      <Text style={styles.subtitle}>Add or manage your products and categories below</Text>

      <View style={styles.grid}>
        <Link href="/Addproduct" asChild>
          <TouchableOpacity style={[styles.button, styles.yellow]}>
            <Text style={styles.buttonIcon}>➕</Text>
            <Text style={styles.buttonText}>Add Product</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/Productlist" asChild>
          <TouchableOpacity style={[styles.button, styles.blue]}>
            <Text style={styles.buttonIcon}>📦</Text>
            <Text style={styles.buttonText}>All Products</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/Categorylist" asChild>
          <TouchableOpacity style={[styles.button, styles.blue]}>
            <Text style={styles.buttonIcon}>📦</Text>
            <Text style={styles.buttonText}>All Category</Text>
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
    justifyContent: 'flex-start',
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
    marginBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    width: '48%', // Two buttons per row for now, but flexible for more
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6, // Increased for better shadow effect
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 16,
  },
  yellow: {
    backgroundColor: '#FDE68A', // Add Product: Yellow
  },
  blue: {
    backgroundColor: '#93C5FD', // All Products: Blue
  },
  green: {
    backgroundColor: '#A7F3D0', // Add Category: Green
  },
  buttonIcon: {
    fontSize: 32,
    marginBottom: 8,
    color: '#1E293B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});