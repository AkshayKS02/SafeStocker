import React, { useState } from 'react';
import {View,FlatList,StyleSheet,TouchableOpacity,Text,} from 'react-native';
import ExpiryCard from '../../components/ExpiryCard';

export default function TrackScreen() {
  const [sortBy, setSortBy] = useState('date');

  // 🔹 Sample data
  const data = [
    {
      id: '1',
      name: 'Potato Chips',
      barcode: '8901491101837',
      stock: 12,
      daysLeft: -1,
    },
    {
      id: '2',
      name: 'Milk',
      barcode: '123456789',
      stock: 5,
      daysLeft: 2,
    },
    {
      id: '3',
      name: 'Bread',
      barcode: '987654321',
      stock: 3,
      daysLeft: 6,
    },
    {
      id: '4',
      name: 'Eggs',
      barcode: '456789123',
      stock: 24,
      daysLeft: 10,
    },
        {
      id: '5',
      name: 'wheat',
      barcode: '45678915423',
      stock: 10,
      daysLeft: 0,
    },
        {
      id: '6',
      name: 'soya',
      barcode: '456781009123',
      stock: 240,
      daysLeft: 100,
    },
  ];

  // 🔹 Sorting logic
  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'quantity') {
      return b.stock - a.stock;
    }
    if (sortBy === 'date') {
      return a.daysLeft - b.daysLeft;
    }
    return 0;
  });

  return (
    <View style={styles.container}>

      {/* 🔹 Sort Buttons */}
      <View style={styles.sortContainer}>
        <SortButton
          title="Name"
          active={sortBy === 'name'}
          onPress={() => setSortBy('name')}
        />
        <SortButton
          title="Quantity"
          active={sortBy === 'quantity'}
          onPress={() => setSortBy('quantity')}
        />
        <SortButton
          title="Expiry"
          active={sortBy === 'date'}
          onPress={() => setSortBy('date')}
        />
      </View>

      {/* 🔹 Cards List */}
      <FlatList
        data={sortedData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ExpiryCard
            name={item.name}
            barcode={item.barcode}
            stock={item.stock}
            daysLeft={item.daysLeft}
            onDelete={() => console.log('Delete:', item.id)}
          />
        )}
      />
    </View>
  );
}

/* 🔹 Sort Button Component */
function SortButton({ title, active, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.sortButton, active && styles.sortButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.sortText, active && styles.sortTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/* 🔹 Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },

  sortContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },

  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4B7BFF',
  },

  sortButtonActive: {
    backgroundColor: '#4B7BFF',
  },

  sortText: {
    color: '#4B7BFF',
    fontWeight: '500',
  },

  sortTextActive: {
    color: '#FFFFFF',
  },
});