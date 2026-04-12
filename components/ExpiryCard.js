import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ExpiryCard({
  name,
  barcode,
  stock,
  daysLeft,
  onDelete
}) {
  // 🎯 Status Logic
  let status = 'Fresh';
  let color = '#2ECC71';

  if (daysLeft <= 0) {
    status = 'Expired';
    color = '#E74C3C';
  } else if (daysLeft <= 3) {
    status = 'Critical';
    color = '#FF9800';
  } else if (daysLeft <= 7) {
    status = 'Expiring Soon';
    color = '#F1C40F';
  }

  return (
    <View style={styles.card}>

      {/* Top Row */}
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>

        <TouchableOpacity onPress={onDelete}>
          <MaterialIcons name="delete-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Barcode */}
      <Text style={styles.barcode}>Barcode : {barcode}</Text>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        
        <View style={styles.stockBox}>
          <Text style={styles.stockText}>In Stock : {stock}</Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={[styles.statusText, { color }]}>{status}</Text>
        </View>

      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F2F4F7',
    padding: 16,
    borderRadius: 20,
    marginVertical: 10,

    // Shadow (soft like your image)
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  barcode: {
    marginTop: 6,
    color: '#666',
    fontSize: 14,
  },

  bottomRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stockBox: {
    backgroundColor: '#E6ECFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  stockText: {
    color: '#3B5BDB',
    fontWeight: '600',
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },

  statusText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});