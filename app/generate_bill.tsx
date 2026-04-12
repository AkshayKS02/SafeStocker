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
import { useRouter } from 'expo-router';

export default function GenerateBillScreen() {
  const router = useRouter();

  // State for customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Dummy data for the finalized bill items
  const billItems = [
    { id: '1', name: 'Potato Chips', qty: 2, price: 40 },
    { id: '2', name: 'Thumbs Up (500ml)', qty: 1, price: 40 },
    { id: '3', name: 'Dairy Milk Silk', qty: 1, price: 85 },
  ];

  // Calculate total
  const totalAmount = billItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Preview</Text>
        <View style={{ width: 40 }} /> {/* Placeholder to balance header */}
      </View>

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Customer Details Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Customer Name (Optional)"
                placeholderTextColor="#9AA0A6"
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number (Optional)"
                placeholderTextColor="#9AA0A6"
                keyboardType="phone-pad"
                value={customerPhone}
                onChangeText={setCustomerPhone}
              />
            </View>
          </View>

          {/* Order Summary Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            
            {/* Bill Items Loop */}
            {billItems.map((item, index) => (
              <View key={item.id}>
                <View style={styles.billItemRow}>
                  <View style={styles.billItemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>Qty: {item.qty}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>
                {/* Don't show divider after the last item */}
                {index < billItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}

            {/* Bill Breakdown */}
            <View style={styles.breakdownSection}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={styles.breakdownValue}>₹{totalAmount}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tax (0%)</Text>
                <Text style={styles.breakdownValue}>₹0</Text>
              </View>
            </View>
          </View>

        </ScrollView>

        {/* Fixed Bottom Action Section */}
        <View style={styles.bottomSection}>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₹{totalAmount}</Text>
          </View>

          <TouchableOpacity style={styles.completeButton} onPress={() => {
            // Add your complete order logic here
            alert("Bill Generated Successfully!");
            router.push('/billing'); // Or route back to home
          }}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.completeButtonText}>Complete Payment</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF3F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#EEF3F4',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D9D9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 16,
  },
  
  // --- Card Styles ---
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D1D9D9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },

  // --- Input Styles ---
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
  },

  // --- Order Summary Styles ---
  billItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billItemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 13,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 8,
  },
  breakdownSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#EAF0F0',
    borderStyle: 'dashed', // Gives a nice receipt feel
    gap: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },

  // --- Bottom Section Styles ---
  bottomSection: {
    backgroundColor: '#FFF',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#D1D9D9',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F6EEB', // Highlighted in primary blue
  },
  completeButton: {
    backgroundColor: '#61BC6D', // Green for success/checkout
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});