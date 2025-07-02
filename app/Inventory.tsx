import { FontAwesome5 } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type AppRoutes =
  | '/Products'
  | '/Reports'
  | '/Expenses'
  | '/Payment'
  | '/Credit'
  | '/Cash'
  | '/StockManager'
  | '/Sales';

interface MenuItem {
  label: string;
  icon: string;
  href: AppRoutes;
}

const menuItems: MenuItem[] = [
  { label: 'Products', icon: 'box-open', href: '/Products' },
  { label: 'Reports', icon: 'chart-line', href: '/Reports' },
  { label: 'Expenses', icon: 'money-bill-wave', href: '/Expenses' },
  { label: 'Payment', icon: 'credit-card', href: '/Payment' },
  { label: 'Credit', icon: 'hand-holding-usd', href: '/Credit' },
  { label: 'Cash', icon: 'money-check-alt', href: '/Cash' },
  { label: 'Stock Manager', icon: 'warehouse', href: '/StockManager' },
  { label: 'Sales', icon: 'shopping-cart', href: '/Sales' },
];

export default function Inventory() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍳 EggCited Dashboard</Text>
      <Text style={styles.subtitle}>Manage your sandwich empire, one tap at a time.</Text>
      <View style={styles.grid}>
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href} asChild>
            <TouchableOpacity style={styles.gridItem}>
              <FontAwesome5 name={item.icon} size={30} color="#fff" />
              <Text style={styles.gridText}>{item.label}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDEB', // soft yellow background
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#F59E0B', // egg yolk orange
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#374151',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    backgroundColor: '#FBBF24', // golden egg tone
    width: '48%',
    aspectRatio: 1,
    borderRadius: 18,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  gridText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});
