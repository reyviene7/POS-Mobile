import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Cash</Text>
      <Text style={styles.subtitle}>Log cash transactions.</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>+ Log Cash Transaction</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = getStyles();
function getStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#EEF2FF',
      padding: 24,
      justifyContent: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#4338CA',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: '#4B5563',
      marginBottom: 24,
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#6366F1',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignSelf: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
