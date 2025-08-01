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
              // Explicitly disable header for Login and index
              if (route.name === 'Home' || route.name === 'index') {
                return {
                  headerShown: false,
                };
              }
              // Apply custom header styles for other screens
              return {
                headerStyle: {
                  backgroundColor: '#FCD34D', // Buttery yellow
                },
                headerTintColor: '#431407', // Toasted brown
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
                headerShadowVisible: true,
              };
            }}
          >
            <Stack.Screen name="index" options={{ title: '🥖 EggCited Login', headerShown: false }} />
            <Stack.Screen name="Home" options={{ title: '🥪 EggCited Home', headerShown: false }} />
            <Stack.Screen name="Inventory" options={{ title: '📦 Sandwich Inventory' }} />
            <Stack.Screen name="PointOfSales" options={{ title: '🛒 Sandwich Shop', gestureEnabled: false, }} />
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
            <Stack.Screen 
              name="PrintConfig" 
              options={{ 
                title: '🖨️ Printer Setup',
                headerRight: () => (
                  <View style={styles.headerRight}>
                    <Text style={styles.headerRightText}>Bluetooth</Text>
                  </View>
                )
              }} 
            />
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
    backgroundColor: '#FCD34D', // Buttery yellow
  },
  headerBorder: {
    flex: 1,
    borderRadius: 24,
    borderTopLeftRadius: 12, // Bitten sandwich corner
    borderBottomRightRadius: 12,
    borderWidth: 2.5,
    borderColor: '#F59E0B', // Toasty crust
    shadowColor: '#431407',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  headerEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'Comic Sans MS',
    fontSize: 22,
    fontWeight: '700',
    color: '#431407',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerRight: {
    marginRight: 15,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  headerRightText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});