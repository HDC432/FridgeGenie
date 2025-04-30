import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomNav from '../components/BottomNav';

function ScanReceiptScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>
        Scan Receipt Screen (Placeholder)
      </Text>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F5'
  },
  placeholderText: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#666'
  }
});

export default ScanReceiptScreen; 