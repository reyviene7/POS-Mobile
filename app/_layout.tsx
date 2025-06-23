import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FCD34D', // deep blue from your logo
        },
        headerTintColor: '#1F2937', // light yellow text/icon
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
      <Stack.Screen name="Inventory" options={{ title: '📦 Inventory' }} />
      <Stack.Screen name="PointOfSales" options={{ title: '🛒 Point of Sale' }} />
      <Stack.Screen name="Products" options={{ title: '📋 Manage Products' }} />
      <Stack.Screen name="Payment" options={{ title: '💰 Payment' }} />
      <Stack.Screen name="Credit" options={{ title: '💳 Credit' }} />
      <Stack.Screen name="Cash" options={{ title: '💵 Cash' }} />
      <Stack.Screen name="Reports" options={{ title: '📊 Reports' }} />
      <Stack.Screen name="Expenses" options={{ title: '💸 Expenses' }} />
      <Stack.Screen name="Productlist" options={{ title: '🧾 Product List' }} />
      <Stack.Screen name='ConfirmOrder' options={{ title: '✅ Confirm Order' }} />
      <Stack.Screen name="Categorylist" options={{ title: '📂 Category List' }} />
      <Stack.Screen name='StockManager' options={{ title: '📊 Stock Manager' }} />
      <Stack.Screen name='Sales' options={{ title: '🧙 Sales Management' }} />
      <Stack.Screen name='SalesHistory' options={{ title: '📜 Sales History' }} />
      <Stack.Screen name='ShiftSummary' options={{ title: '🕒 Shift Summary' }} />
      <Stack.Screen name='AmountReceived' options={{ title: '💵 Amount Received' }} />
      <Stack.Screen name='ReceiptPrint' options={{ title: '🧾 Receipt Print' }} />
      <Stack.Screen name='PaymentComplete' options={{ title: '✅ Payment Complete' }} />
      <Stack.Screen name='PaymentOption' options={{ title: '💳 Payment Options' }} />
    </Stack>
  );
}
