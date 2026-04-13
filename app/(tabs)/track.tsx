import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import ExpiryCard from '../../components/ExpiryCard';
import { useInventory } from '../../context/InventoryContext';

export default function TrackScreen() {
  const [sortBy, setSortBy] = useState('date');
  const { inventory } = useInventory();

  const sortedData = [...inventory].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'quantity') return b.stock - a.stock;
    if (sortBy === 'date') return a.daysLeft - b.daysLeft;
    return 0;
  });

  return (
    <View style={styles.container}>

      {/* Sort Buttons */}
      <View style={styles.sortContainer}>
        <SortButton title="Name" active={sortBy === 'name'} onPress={() => setSortBy('name')} />
        <SortButton title="Quantity" active={sortBy === 'quantity'} onPress={() => setSortBy('quantity')} />
        <SortButton title="Expiry" active={sortBy === 'date'} onPress={() => setSortBy('date')} />
      </View>

      <FlatList
        data={sortedData}
        keyExtractor={(item) => item.id}
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