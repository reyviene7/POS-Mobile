import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Inventory"
        options={{
          title: "Inventory",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PosScreen"
        options={{
          title: "Point of Sale",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Products"
        options={{
          title: "Manage Products",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Payment"
        options={{
          title: "Payment",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Credit"
        options={{
          title: "Credit",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Cash"
        options={{
          title: "Cash",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: "Reports",
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="expenses"
        options={{
          title: "Expenses",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
