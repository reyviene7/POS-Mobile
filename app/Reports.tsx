import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import DateRangeModal from '../src/components/modals/DateRangeModal';
import { generateCashReportPDF } from '../src/components/reports/GenerateCashReport';
import { generateCreditReportPDF } from '../src/components/reports/GenerateCreditReport';
import { generateExpensesReportPDF } from '../src/components/reports/GenerateExpensesReport';
import { generateSalesHistoryPDF } from '../src/components/reports/GenerateSalesReport';
import { generateShiftReportPDF } from '../src/components/reports/GenerateShiftReport';

export default function Reports() {
  const [loading, setLoading] = useState<string | null>(null);
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);

  useEffect(() => {
    if (!hasShownInitialToast) {
      Toast.show({
        type: 'success',
        text1: '🥪 Freshly Baked!',
        text2: 'Welcome to Reports!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      setHasShownInitialToast(true);
    }
  }, [hasShownInitialToast]);
  
  const handleGenerate = async (type: string) => {
    if (type === 'Sales History') {
    setShowDateRangeModal(true);
    return;
    }
    setLoading(type);
    try {
      if (type === 'Shift Summary') {
        await generateShiftReportPDF();
      } else if (type === 'Cash Transactions') {
        await generateCashReportPDF();
      } else if (type === 'Credit Transactions') {
        await generateCreditReportPDF();
      } else if (type === 'Expenses') {
        await generateExpensesReportPDF();
      } else {
        Toast.show({
          type: 'success',
          text1: '🥪 Yum!',
          text2: `${type} Report generated successfully!`,
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
      }
      Toast.show({
        type: 'success',
        text1: '🥪 Yum!',
        text2: `${type} Report generated successfully!`,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: `Failed to generate ${type} Report.`,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDateRangeConfirm = async (start: string, end: string) => {
    setShowDateRangeModal(false);
    setLoading('Sales History');
    try {
      await generateSalesHistoryPDF(start, end);
      Toast.show({
        type: 'success',
        text1: '🥪 Yum!',
        text2: `Sales History Report generated!`,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 40,
      });
    } catch (err) {
      // already handled inside generateSalesHistoryPDF
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Reports</Text>
      <Text style={styles.subtitle}>Generate summaries and detailed insights for EggCited</Text>

      <TouchableOpacity
        style={[styles.reportButton, loading === 'Shift Summary' && styles.buttonDisabled]}
        onPress={() => handleGenerate('Shift Summary')}
        disabled={!!loading}
      >
        {loading === 'Shift Summary' ? (
          <ActivityIndicator color="#92400E" />
        ) : (
          <Text style={styles.reportText}>🕒 Shift Summary Report</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reportButton, loading === 'Sales History' && styles.buttonDisabled]}
        onPress={() => handleGenerate('Sales History')}
        disabled={!!loading}
      >
        {loading === 'Sales History' ? (
          <ActivityIndicator color="#92400E" />
        ) : (
          <Text style={styles.reportText}>📈 Sales History Report</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reportButton, loading === 'Cash Transactions' && styles.buttonDisabled]}
        onPress={() => handleGenerate('Cash Transactions')}
        disabled={!!loading}
      >
        {loading === 'Cash Transactions' ? (
          <ActivityIndicator color="#92400E" />
        ) : (
          <Text style={styles.reportText}>💰 Cash Transactions Report</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reportButton, loading === 'Credit Transactions' && styles.buttonDisabled]}
        onPress={() => handleGenerate('Credit Transactions')}
        disabled={!!loading}
      >
        {loading === 'Credit Transactions' ? (
          <ActivityIndicator color="#92400E" />
        ) : (
          <Text style={styles.reportText}>🏦 Credit Transactions Report</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.reportButton, loading === 'Expenses' && styles.buttonDisabled]}
        onPress={() => handleGenerate('Expenses')}
        disabled={!!loading}
      >
        {loading === 'Expenses' ? (
          <ActivityIndicator color="#92400E" />
        ) : (
          <Text style={styles.reportText}>💸 Expenses Report</Text>
        )}
      </TouchableOpacity>
      <DateRangeModal
        visible={showDateRangeModal}
        onClose={() => setShowDateRangeModal(false)}
        onConfirm={handleDateRangeConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('6%'),
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: wp('7%'),
    fontWeight: '700',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: hp('1%'),
    fontFamily: 'Arial',
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: hp('4%'),
    fontStyle: 'italic',
  },
  reportButton: {
    backgroundColor: '#FCD34D',
    paddingVertical: hp('2.2%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('4.5%'),
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#FBBF24',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  reportText: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#92400E',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});