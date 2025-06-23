import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Products() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🥚 EggCited Products</Text>
      <Text style={styles.subtitle}>
        Manage your menu and categories below
      </Text>

      <View style={styles.grid}>
        <Link href="/Productlist" asChild>
          <TouchableOpacity style={[styles.button, styles.listButton]}>
            <Text style={styles.icon}>📦</Text>
            <Text style={styles.buttonText}>All Products</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/Categorylist" asChild>
          <TouchableOpacity style={[styles.button, styles.categoryButton]}>
            <Text style={styles.icon}>📁</Text>
            <Text style={styles.buttonText}>All Categories</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB', // light egg shell
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F59E0B', // yolk
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#7C3AED', // purple hint for fun
    textAlign: 'center',
    marginBottom: 36,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  addButton: {
    backgroundColor: '#FDE68A', // sunny yellow
  },
  listButton: {
    backgroundColor: '#FCD34D', // golden yellow
  },
  categoryButton: {
    backgroundColor: '#FDBA74', // orange
  },
  icon: {
    fontSize: 34,
    marginBottom: 8,
    color: '#1F2937',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});
