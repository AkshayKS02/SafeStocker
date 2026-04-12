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
import { useRouter } from 'expo-router';

export default function AddStockScreen() {
  const router = useRouter();

  // Form State
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expDate, setExpDate] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Top 3 Buttons / Tabs */}
        <View style={styles.tabsContainer}>
          {/* Standard Button (Routes back to Scan page) */}
          <TouchableOpacity
            style={[styles.tabButton, styles.inactiveTabButton]}
            onPress={() => router.push('/scan')}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>
              Standard
            </Text>
          </TouchableOpacity>

          {/* Custom Button (Routes to custom.tsx) */}
          <TouchableOpacity
            style={[styles.tabButton, styles.inactiveTabButton]}
            onPress={() => router.push('/custom')}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>
              Custom
            </Text>
          </TouchableOpacity>

          {/* Add Stock Button (Active - Current Screen) */}
          <TouchableOpacity
            style={[styles.tabButton, styles.activeTabButton]}
          >
            <Text style={[styles.tabText, styles.activeTabText]}>
              Add stock
            </Text>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <Text style={styles.pageTitle}>Update Stock</Text>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Form Card */}
          <View style={styles.card}>
            
            {/* Item Input */}
            <Text style={styles.inputLabel}>Item</Text>
            <View style={styles.inputWrapper}>
              {/* Note: In a production app, you might swap this TextInput for a Dropdown/Select component */}
              <TextInput
                style={styles.input}
                placeholder="Select Item"
                placeholderTextColor="#9AA0A6"
                value={item}
                onChangeText={setItem}
              />
            </View>

            {/* Quantity Input */}
            <Text style={styles.inputLabel}>Quantity</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Select Quantity"
                placeholderTextColor="#9AA0A6"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>

            {/* Manufacturing Date Input */}
            <Text style={styles.inputLabel}>Manufacturing Date</Text>
            <View style={styles.inputWrapper}>
              {/* Note: Swap for a DateTimePicker component for real date selection */}
              <TextInput
                style={styles.input}
                placeholder="Select Date"
                placeholderTextColor="#9AA0A6"
                value={mfgDate}
                onChangeText={setMfgDate}
              />
            </View>

            {/* Expiry Date Input */}
            <Text style={styles.inputLabel}>Expiry Date</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Select Date"
                placeholderTextColor="#9AA0A6"
                value={expDate}
                onChangeText={setExpDate}
              />
            </View>

            {/* Update Stock Button */}
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Update Stock</Text>
            </TouchableOpacity>

          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA',
    paddingTop: 20, 
  },
  
  // --- Top Tabs ---
  tabsContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginBottom: 24, 
    gap: 10 
  },
  tabButton: { 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20 
  },
  activeTabButton: { 
    backgroundColor: '#4285F4' 
  },
  inactiveTabButton: { 
    backgroundColor: '#E8F0FE' 
  },
  tabText: { 
    fontSize: 14, 
    fontWeight: '500' 
  },
  activeTabText: { 
    color: '#FFF' 
  },
  inactiveTabText: { 
    color: '#4285F4' 
  },
  
  // --- Page Title ---
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 24,
    marginBottom: 16,
  },

  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },

  // --- Main Card ---
  card: { 
    backgroundColor: '#EAF0F0', 
    borderRadius: 16, 
    paddingTop: 24,
    paddingBottom: 30,
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: '#D1D9D9',
  },
  
  // --- Inputs ---
  inputLabel: { 
    fontSize: 13, 
    color: '#5F6368', 
    marginBottom: 6,
    fontWeight: '500'
  },
  inputWrapper: { 
    width: '85%', 
    backgroundColor: '#D1D9D9', 
    borderRadius: 12, 
    marginBottom: 20 
  },
  input: { 
    height: 48, 
    textAlign: 'center', 
    color: '#333', 
    fontWeight: '500',
    fontSize: 15
  },
  
  // --- Action Button ---
  primaryButton: { 
    backgroundColor: '#4285F4', 
    paddingVertical: 14, 
    paddingHorizontal: 32, 
    borderRadius: 24, 
    marginTop: 10,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 4, 
    elevation: 3 
  },
  primaryButtonText: { 
    color: '#FFF', 
    fontWeight: '600', 
    fontSize: 16 
  }
});