import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import { getPrinter } from "../src/constants/printerUtils";

export default function PrintConfig({ navigation }: { navigation: any }) {
  type Device = {
    name: string;
    address: string;
  };
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [connected, setConnected] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [PrinterModule, setPrinterModule] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('JavaScript Engine:', typeof HermesInternal === 'undefined' ? 'JSC' : 'Hermes');
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      (async () => {
              try {
                const p = await getPrinter();
                setPrinterModule(p);
              } catch (err) {
                console.error("Failed to load printer:", err);
              }
            })();
    }
  }, []);
  
  useEffect(() => {
  const loadSavedPrinter = async () => {
    try {
      const savedPrinter = await AsyncStorage.getItem('selectedPrinter');
      if (savedPrinter) {
        const printerData = JSON.parse(savedPrinter);
        setSelectedPrinter(printerData);
        
        // Attempt to reconnect if previously connected
        if (printerData.connected && PrinterModule) {
          try {
            await BluetoothManager.connect(printerData.address);
            setConnected(true);
          } catch (err) {
            console.log('Reconnection failed, proceeding with saved config');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load saved printer:', err);
    }
  };

  if (PrinterModule) loadSavedPrinter();
}, [PrinterModule]);

  useEffect(() => {
  if (PrinterModule) {
    const { BluetoothManager } = PrinterModule;
    if (BluetoothManager && typeof BluetoothManager.checkBluetoothEnabled === 'function') {
      checkBluetooth();
    } else {
      console.error('BluetoothManager is not properly initialized');
      Toast.show({
        type: 'error',
        text1: 'Module Error',
        text2: 'BluetoothManager is not available',
        position: 'top',
      });
    }
  }
}, [PrinterModule]);

  if (!PrinterModule) {
    return (
      <View>
        <Text>Loading printer module…</Text>
      </View>
    );
  }

  const { BluetoothEscposPrinter, BluetoothManager } = PrinterModule;

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        return Object.values(granted).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const checkBluetooth = async () => {
    const hasPerm = await requestBluetoothPermissions();
    if (!hasPerm) {
      Toast.show({
        type: 'error',
        text1: '🔒 Permission Required',
        text2: 'Bluetooth permissions are needed to scan for printers',
        position: 'top',
      });
      return;
    }
    try {
      const enabled = await BluetoothManager.checkBluetoothEnabled();
      if (!enabled) {
        await BluetoothManager.enableBluetooth();
        await new Promise(res => setTimeout(res, 2000));
      }
      scanDevices();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '🧀 Bluetooth Error',
        text2: 'Failed to enable Bluetooth',
        position: 'top',
      });
    }
  };

  const scanDevices = async () => {
    setIsScanning(true);
    try {
      const scannedStr = await BluetoothManager.scanDevices(); // returns a string
      const scanned = JSON.parse(scannedStr); // ✅ now parsed into an object
      const allDevices = [...(scanned.paired || []), ...(scanned.found || [])];
      setDevices(allDevices);

      if (allDevices.length === 0) {
        Toast.show({
          type: 'info',
          text1: '🔍 No Printers Found',
          text2: 'Make sure your printer is turned on and paired',
          position: 'top',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '🍞 Scan Error',
        text2: 'Failed to scan for devices',
        position: 'top',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const connectPrinter = async (device: Device | null) => {
    if (!device) {
      Toast.show({
        type: 'error',
        text1: 'No Device',
        text2: 'Please select a printer to connect',
        position: 'top',
      });
      return;
    }

    try {
      // First disconnect if already connected to another device
      if (selectedPrinter && selectedPrinter.address !== device.address) {
        await BluetoothManager.disconnect();
      }

      // Connect to new device
      await BluetoothManager.connect(device.address);
      // Update state
      setConnected(true);
      setSelectedPrinter(device);
      
      // Immediately save the printer info
      await AsyncStorage.setItem('selectedPrinter', JSON.stringify({
        ...device,
        connected: true
      }));

      Toast.show({
        type: 'success',
        text1: 'Connected!',
        text2: `Ready to print with ${device.name}`,
        position: 'top',
      });

    } catch (error) {
      console.error('Connection error:', error);
      setConnected(false);
        Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: (error && typeof error === 'object' && 'message' in error) ? (error as { message?: string }).message : 'Could not connect to printer',
        position: 'top',
      });
    }
  };

  const confirmSetup = async () => {
    if (!selectedPrinter) {
      Toast.show({
        type: 'error',
        text1: 'No Printer Selected',
        text2: 'Please select a printer before proceeding',
        position: 'top',
      });
      return;
    }

    try {
      // Save printer with connection status
      await AsyncStorage.setItem('selectedPrinter', JSON.stringify({
        ...selectedPrinter,
        connected: true,
        timestamp: new Date().toISOString()
      }));
      router.push('/PointOfSales');
      
    } catch (err) {
      console.error('Failed to save printer:', err);
      Toast.show({
        type: 'error',
        text1: 'Save Error',
        text2: 'Failed to save printer configuration',
        position: 'top',
      });
    }
  };

  const testPrint = async () => {
    if (!connected || !selectedPrinter) {
      Toast.show({
        type: 'error',
        text1: '⚠️ Not Connected',
        text2: 'Please connect to a printer first',
        position: 'top',
      });
      return;
    }
    try {
      await BluetoothEscposPrinter.printText('Hello from EggCited App!\n\r', {
        encoding: 'GBK',
        codepage: 0,
        widthtimes: 0,
        heigthtimes: 0,
        fonttype: 1,
      });
      await BluetoothEscposPrinter.printText('\n\r', {});
      Toast.show({
        type: 'success',
        text1: '✅ Test Print Sent',
        text2: `Check your ${selectedPrinter.name}`,
        position: 'top',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: '🖨️ Print Failed',
        text2: 'Could not send test print',
        position: 'top',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🖨️ Eggcited Printer Setup</Text>
      <Text style={styles.subtitle}>Connect your toast-making machine!</Text>
      
      <TouchableOpacity 
        style={styles.scanButton} 
        onPress={scanDevices}
        disabled={isScanning}
      >
        {isScanning ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.buttonText}>Scanning...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <FontAwesome5 name="search" size={16} color="#fff" />
            <Text style={styles.buttonText}> Scan for Printers</Text>
          </View>
        )}
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.address}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="print" size={40} color="#FBBF24" />
            <Text style={styles.emptyText}>No printers found yet!</Text>
            <Text style={styles.emptySubtext}>Make sure your printer is on and paired</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.deviceItem,
              selectedPrinter?.address === item.address && styles.selectedDevice
            ]}
            onPress={() => connectPrinter(item)}
          >
            <FontAwesome5 
              name="bluetooth-b" 
              size={20} 
              color={selectedPrinter?.address === item.address ? "#10B981" : "#6B7280"} 
            />
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{item.name || 'Unknown Printer'}</Text>
              <Text style={styles.deviceAddress}>{item.address}</Text>
            </View>
            {selectedPrinter?.address === item.address && (
              <FontAwesome5 name="check-circle" size={20} color="#10B981" />
            )}
          </TouchableOpacity>
        )}
      />

      {connected && (
        <>
          <TouchableOpacity style={styles.testButton} onPress={testPrint}>
            <View style={styles.buttonContent}>
              <FontAwesome5 name="print" size={16} color="#fff" />
              <Text style={styles.buttonText}> Test Print</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={confirmSetup}
          >
            <View style={styles.buttonContent}>
              <FontAwesome5 name="check" size={16} color="#fff" />
              <Text style={styles.buttonText}> All Set! Back to Kitchen</Text>
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'),
    backgroundColor: '#FFFDE7',
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp('0.5%'),
    color: '#F59E0B',
  },
  subtitle: {
    fontSize: wp('4%'),
    textAlign: 'center',
    color: '#78350F',
    marginBottom: hp('3%'),
  },
  testButton: {
    backgroundColor: '#3B82F6',
    padding: hp('2%'),
    borderRadius: wp('3%'),
    marginTop: hp('1%'),
    alignItems: 'center',
    elevation: 3,
  },
  scanButton: {
    backgroundColor: '#F59E0B',
    padding: hp('2%'),
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontWeight: '600',
    marginLeft: wp('2%'),
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: hp('2%'),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('10%'),
  },
  emptyText: {
    fontSize: wp('4.5%'),
    color: '#78350F',
    marginTop: hp('2%'),
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: wp('3.5%'),
    color: '#92400E',
    marginTop: hp('1%'),
    textAlign: 'center',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1%'),
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedDevice: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: wp('4%'),
  },
  deviceName: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#431407',
  },
  deviceAddress: {
    fontSize: wp('3.2%'),
    color: '#6B7280',
    marginTop: hp('0.5%'),
  },
  confirmButton: {
    backgroundColor: '#10B981',
    padding: hp('2%'),
    borderRadius: wp('3%'),
    marginTop: hp('2%'),
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});