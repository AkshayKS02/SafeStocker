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

export default function CustomScreen() {
  const router = useRouter();
  
  // State for the form inputs
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

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

          {/* Custom Button (Active - Current Screen) */}
          <TouchableOpacity
            style={[styles.tabButton, styles.activeTabButton]}
          >
            <Text style={[styles.tabText, styles.activeTabText]}>
              Custom
            </Text>
          </TouchableOpacity>

          {/* Add Stock Button (Routes to add_stock.tsx) */}
          <TouchableOpacity
            style={[styles.tabButton, styles.inactiveTabButton]}
            onPress={() => router.push('/add_stock')}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>
              Add stock
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Custom Items Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Custom Items</Text>
            
            {/* Name Input */}
            <Text style={styles.inputLabel}>Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter Name"
                placeholderTextColor="#9AA0A6"
                value={itemName}
                onChangeText={setItemName}
              />
            </View>

            {/* Price Input */}
            <Text style={styles.inputLabel}>Price</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter Price"
                placeholderTextColor="#9AA0A6"
                keyboardType="numeric"
                value={itemPrice}
                onChangeText={setItemPrice}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Generate Barcode</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Save Item</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Barcode Preview Card */}
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Barcode Preview</Text>
            
            <View style={styles.barcodePlaceholder}>
              {/* This is a visual mock of a barcode. 
                  Replace this whole view with a real barcode image or library like 'react-native-svg-barcode' later */}
              <Text style={styles.barcodeMockText}>
                ||||| || ||||| 
              </Text>
              <Text style={styles.barcodeNumbers}>0 76950 45047 9</Text>
            </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff',
    paddingTop: 20, 
  },
  
  // --- Top Tabs ---
  tabsContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginBottom: 20, 
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
  
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },

  // --- Main Card ---
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    paddingTop: 24, 
    alignItems: 'center', 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1D9D9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#000', 
    marginBottom: 20 
  },
  
  // --- Inputs ---
  inputLabel: { 
    fontSize: 12, 
    color: '#5F6368', 
    marginBottom: 6,
    fontWeight: '500'
  },
  inputWrapper: { 
    width: '85%', 
    backgroundColor: '#D1D9D9', 
    borderRadius: 8, 
    marginBottom: 20 
  },
  input: { 
    height: 44, 
    textAlign: 'center', 
    color: '#333', 
    fontWeight: '500',
    fontSize: 16
  },
  
  // --- Action Buttons ---
  actionButtonsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 12, 
    marginBottom: 24, 
    marginTop: 10,
    width: '100%' 
  },
  primaryButton: { 
    backgroundColor: '#4285F4', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  primaryButtonText: { 
    color: '#FFF', 
    fontWeight: '600', 
    fontSize: 14 
  },
  secondaryButton: { 
    backgroundColor: '#EAF0F0', // Matches card bg to blend in
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#707070', // Darker border as seen in the image
  },
  secondaryButtonText: { 
    color: '#333', 
    fontWeight: '500', 
    fontSize: 14 
  },

  // --- Preview Card ---
  previewCard: {
    backgroundColor: '#EAF0F0',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D9D9',
  },
  previewLabel: { 
    color: '#5F6368', 
    fontSize: 18, 
    fontWeight: '500',
    marginBottom: 20,
    letterSpacing: 0.5
  },
  barcodePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  barcodeMockText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
    transform: [{ scaleY: 1.5 }], // Stretches text vertically to look like a barcode
    marginBottom: 10,
  },
  barcodeNumbers: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    letterSpacing: 4,
  }
});