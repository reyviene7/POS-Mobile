import { FontAwesome5 } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define the allowed routes
type AppRoutes = '/Products' | '/Reports' | '/Expenses' | '/Payment' | '/Credit' | '/Cash' | '/StockManager';

// Define the type for menu items
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
];

export default function Inventory() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧙 Inventory Wizard</Text>
      <View style={styles.grid}>
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href} asChild>
            <TouchableOpacity style={styles.gridItem}>
              <FontAwesome5 name={item.icon} size={32} color="#ffffff" />
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#4338CA',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    backgroundColor: '#6366F1',
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  gridText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
});