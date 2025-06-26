import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../src/constants/toastConfig';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={({ route }) => {
              // Disable header entirely on "index"
              if (route.name === 'index') {
                return {
                  headerShown: false,
                };
              }

              // Apply custom header styles for other screens
              return {
                headerStyle: {
                  backgroundColor: '#FCD34D',
                },
                headerTintColor: '#431407',
                headerTitleAlign: 'center',
                headerTitle: ({ children, tintColor }) => (
                  <View style={styles.headerContainer}>
                    <Text style={[styles.headerTitle, { color: tintColor }]}>
                      {children}
                    </Text>
                  </View>
                ),
                headerBackground: () => (
                  <View style={styles.headerBackground}>
                    <View style={styles.headerBorder} />
                  </View>
                ),
              };
            }}
          >
            <Stack.Screen name="index" options={{ title: 'Home' }} />
            <Stack.Screen name="Inventory" options={{ title: '📦 Sandwich Inventory' }} />
            <Stack.Screen name="PointOfSales" options={{ title: '🛒 Sandwich Shop' }} />
            <Stack.Screen name="Products" options={{ title: '🧀 Manage Products' }} />
            <Stack.Screen name="Payment" options={{ title: '💰 Sandwich Payments' }} />
            <Stack.Screen name="Credit" options={{ title: '💳 Sandwich Credits' }} />
            <Stack.Screen name="Cash" options={{ title: '💵 Cash Tray' }} />
            <Stack.Screen name="Reports" options={{ title: '📊 Sandwich Stats' }} />
            <Stack.Screen name="Expenses" options={{ title: '💸 EggCited Costs' }} />
            <Stack.Screen name="Productlist" options={{ title: '🧾 Product List' }} />
            <Stack.Screen name="ConfirmOrder" options={{ title: '✅ Order Toasted!' }} />
            <Stack.Screen name="Categorylist" options={{ title: '📂 Sandwich Categories' }} />
            <Stack.Screen name="StockManager" options={{ title: '🧾 Ingredient Stock' }} />
            <Stack.Screen name="Sales" options={{ title: '💰 EggCited Magic' }} />
            <Stack.Screen name="SalesHistory" options={{ title: '📜 EggCited Sales Log' }} />
            <Stack.Screen name="ShiftSummary" options={{ title: '🕒 Shift Wrap-Up' }} />
            <Stack.Screen name="AmountReceived" options={{ title: '💵 Cash Collected' }} />
            <Stack.Screen name="ReceiptPrint" options={{ title: '🧾 Receipt Toaster' }} />
            <Stack.Screen name="PaymentComplete" options={{ title: '✅ Payment Toasted!' }} />
            <Stack.Screen name="PaymentOption" options={{ title: '💳 Payment Choices' }} />
          </Stack>
          <Toast config={toastConfig} />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    flex: 1,
    backgroundColor: 'rgba(254, 243, 199, 0.95)',
    borderBottomWidth: 2.5,
    borderBottomColor: '#F59E0B',
  },
  headerBorder: {
    flex: 1,
    borderRadius: 16,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
    shadowColor: '#431407',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Comic Sans MS',
    fontSize: 20,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});