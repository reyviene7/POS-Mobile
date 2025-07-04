import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

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
    backgroundColor: '#FFFBEB',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('6%'),
  },
  title: {
    fontSize: wp('7%'),
    fontWeight: '800',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: wp('4.2%'),
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: hp('4%'),
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: hp('2%'), // only works on RN 0.73+
    columnGap: wp('4%'), // only works on RN 0.73+
  },
  button: {
    width: wp('40%'),
    aspectRatio: 1,
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  listButton: {
    backgroundColor: '#FCD34D',
  },
  categoryButton: {
    backgroundColor: '#FDBA74',
  },
  icon: {
    fontSize: wp('8%'),
    marginBottom: hp('1%'),
    color: '#1F2937',
  },
  buttonText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});