import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import SalesChart from './SalesChart';

export default function Sales() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📈 EggCited Sales</Text>
      <Text style={styles.subtitle}>Manage your daily egg drops</Text>

      <SalesChart />

      <View style={styles.grid}>
        {/* Shift Summary */}
        <Link href="/ShiftSummary" asChild>
          <TouchableOpacity style={[styles.card, styles.indigo]}>
            <Text style={styles.icon}>🕒</Text>
            <Text style={styles.label}>Shift Summary</Text>
          </TouchableOpacity>
        </Link>

        {/* Sales History */}
        <Link href="/SalesHistory" asChild>
          <TouchableOpacity style={[styles.card, styles.yellow]}>
            <Text style={styles.icon}>📊</Text>
            <Text style={styles.label}>Sales History</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDEB',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('6%'),
  },
  title: {
    fontSize: wp('6.5%'),
    fontWeight: 'bold',
    color: '#B45309',
    textAlign: 'center',
    marginBottom: hp('0.5%'),
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: hp('4%'),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Spread out cards
    paddingHorizontal: wp('7%'),     // Side margin for center alignment
    marginTop: hp('2%'),
  },
  card: {
    width: wp('40%'),               // Fixed width (2 cards per row with space)
    aspectRatio: 1,                 // Makes it square
    borderRadius: wp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2.5%'),       
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  indigo: {
    backgroundColor: '#C7D2FE',
  },
  yellow: {
    backgroundColor: '#FDE68A',
  },
  icon: {
    fontSize: wp('9%'),
    marginBottom: hp('1%'),
    color: '#1F2937',
  },
  label: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});
