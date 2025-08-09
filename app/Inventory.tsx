import { FontAwesome5 } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

type AppRoutes =
  | '/Products'
  | '/Reports'
  | '/Expenses'
  | '/Payment'
  | '/Credit'
  | '/Cash'
  | '/StockManager'
  | '/Sales'
  | '/PrintConfig'; 

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
  { label: 'Printer Setup', icon: 'print', href: '/PrintConfig' },
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
    backgroundColor: '#FFFDEB',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('6%'),
  },
  title: {
    fontSize: wp('7.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp('1%'),
    color: '#F59E0B',
  },
  subtitle: {
    fontSize: wp('4%'),
    textAlign: 'center',
    color: '#374151',
    marginBottom: hp('3%'),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    backgroundColor: '#FBBF24',
    width: '48%',
    aspectRatio: 1,
    borderRadius: wp('4.5%'),
    marginBottom: hp('2%'),
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
    fontSize: wp('4%'),
    fontWeight: '600',
    marginTop: hp('1%'),
  },
});
