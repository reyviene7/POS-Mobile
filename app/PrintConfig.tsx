import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';

const PrintConfig = ({ navigation }: { navigation: any }) => {
  type Device = {
    name: string;
    address: string;
  };
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [connected, setConnected] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
  checkBluetooth();
  return () => {
    if (connected && selectedPrinter) {
      BluetoothManager.disconnect();
    }
  };
}, []);

  const checkBluetooth = async () => {
    try {
      const enabled = await BluetoothManager.isBluetoothEnabled();
      if (!enabled) {
        await BluetoothManager.enableBluetooth();
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
      const scanned = await BluetoothManager.scanDevices();
      const paired = JSON.parse(scanned.paired);
      setDevices(paired);
      if (paired.length === 0) {
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
        text1: '🥪 No Device',
        text2: 'Please select a printer to connect',
        position: 'top',
      });
      return;
    }
    try {
      await BluetoothManager.connect(device.address);
      setConnected(true);
      setSelectedPrinter(device);
      Toast.show({
        type: 'success',
        text1: '🖨️ Connected!',
        text2: `Ready to print with ${device.name}`,
        position: 'top',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '🧇 Connection Failed',
        text2: 'Could not connect to printer',
        position: 'top',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🖨️ Sandwich Printer Setup</Text>
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
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.buttonContent}>
            <FontAwesome5 name="check" size={16} color="#fff" />
            <Text style={styles.buttonText}> All Set! Back to Kitchen</Text>
          </View>
        </TouchableOpacity>
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

export default PrintConfig;