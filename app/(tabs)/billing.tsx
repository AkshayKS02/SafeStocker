import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import useRouter

export default function BillingScreen() {
  const router = useRouter(); // Initialize router
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy data for the product list
  const products = [
    { id: '1', name: 'Potato Chips', barcode: '8901491101837', price: '20', stock: 12 },
    { id: '2', name: 'Potato Chips', barcode: '8901491101837', price: '20', stock: 12 },
    { id: '3', name: 'Potato Chips', barcode: '8901491101837', price: '20', stock: 12 },
    { id: '4', name: 'Potato Chips', barcode: '8901491101837', price: '20', stock: 12 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Fixed Top Section: Title & Search */}
        <View style={styles.topSection}>
          <Text style={styles.pageTitle}>Billing</Text>
          
          <View style={styles.searchRow}>
            <View style={styles.searchWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search product or scan barcode..."
                placeholderTextColor="#9AA0A6"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.scanButton}>
              <Ionicons name="scan-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Products List */}
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>Products</Text>
          
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
          >
            {products.map((item) => (
              <View key={item.id} style={styles.productCard}>
                
                {/* Left Side: Product Details */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productBarcode}>{item.barcode}</Text>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                </View>

                {/* Right Side: Action & Stock */}
                <View style={styles.productAction}>
                  <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+Add</Text>
                  </TouchableOpacity>
                  <Text style={styles.stockText}>In Stock : {item.stock}</Text>
                </View>
                
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Fixed Bottom Section: Current Bill */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Current Bill</Text>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹0</Text>
          </View>

          {/* Generate Bill Button -> Routes to generate_bill */}
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={() => router.push('/generate_bill')}
          >
            <Text style={styles.generateButtonText}>Generate Bill</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF3F4', // Light teal/grey background
  },
  container: {
    flex: 1,
  },
  
  // --- Top Section ---
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    backgroundColor: '#DDE4E4', // Slightly darker input background
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  searchInput: {
    fontSize: 14,
    color: '#333',
    height: '100%',
  },
  scanButton: {
    backgroundColor: '#111',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- Products Section ---
  productsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 20,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D9D9',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  productBarcode: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  productAction: {
    alignItems: 'flex-end',
  },
  addButton: {
    backgroundColor: '#4F6EEB', // Blue accent color
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stockText: {
    fontSize: 11,
    color: '#4F6EEB',
    fontWeight: '600',
    backgroundColor: '#E8F0FE', // Light blue background pill
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // --- Bottom Bill Card ---
  billCard: {
    backgroundColor: '#EAF0F0', // Matches the teal/grey theme
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D1D9D9',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10, // For Android shadow
  },
  billTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  generateButton: {
    backgroundColor: '#61BC6D', // Green button
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});