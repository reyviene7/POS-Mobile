import { Platform } from 'react-native';

export async function getPrinter() {
  if (Platform.OS !== 'android') {
    console.log('Non-Android platform detected, returning null');
    return null; // Return null instead of throwing error for non-Android
  }
  
  try {
    const { BluetoothEscposPrinter, BluetoothManager } = await import(
      '@brooons/react-native-bluetooth-escpos-printer'
    );
    if (!BluetoothEscposPrinter || !BluetoothManager) {
      throw new Error('Failed to load BluetoothEscposPrinter or BluetoothManager');
    }
    return { BluetoothEscposPrinter, BluetoothManager };
  } catch (err) {
    console.error('Error loading printer module:', err);
    throw err;
  }
}