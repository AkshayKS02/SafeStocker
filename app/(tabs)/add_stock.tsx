import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddStockScreen() {
  const router = useRouter();

  // Form State
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');

  // Item Labels Map (Moved inside the component, out of styles)
  const ITEM_LABELS = {
    paracetamol: 'Paracetamol',
    ibuprofen: 'Ibuprofen',
    amoxicillin: 'Amoxicillin',
  };

  // Date Picker States
  const [mfgDate, setMfgDate] = useState(new Date());
  const [showMfgPicker, setShowMfgPicker] = useState(false);
  const [mfgDateSelected, setMfgDateSelected] = useState(false);

  const [expDate, setExpDate] = useState(new Date());
  const [showExpPicker, setShowExpPicker] = useState(false);
  const [expDateSelected, setExpDateSelected] = useState(false);

  // Date Handlers
  const onChangeMfg = (event, selectedDate) => {
    setShowMfgPicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
    if (selectedDate) {
      setMfgDate(selectedDate);
      setMfgDateSelected(true);
    }
  };

  const onChangeExp = (event, selectedDate) => {
    setShowExpPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpDate(selectedDate);
      setExpDateSelected(true);
    }
  };

  // Helper to format date cleanly
  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Top 3 Buttons / Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, styles.inactiveTabButton]}
            onPress={() => router.push('/scan')}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>
              Standard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, styles.inactiveTabButton]}
            onPress={() => router.push('/custom')}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>
              Custom
            </Text>
          </TouchableOpacity>

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
            
            {/* Item Dropdown */}
            <Text style={styles.inputLabel}>Item</Text>
            <View style={styles.inputWrapper}>
              
              {/* Visually Centered Text (Matches your Date format) */}
              <View style={styles.centeredTextContainer} pointerEvents="none">
                <Text style={[styles.dateText, !item && styles.placeholderText]}>
                  {item ? ITEM_LABELS[item] : 'Select Item'}
                </Text>
              </View>

              {/* Invisible Clickable Picker */}
              <Picker
                selectedValue={item}
                onValueChange={(itemValue) => setItem(itemValue)}
                style={styles.hiddenPicker}
                mode="dropdown" 
              >
                <Picker.Item label="Select Item" value="" />
                <Picker.Item label="Paracetamol" value="paracetamol" />
                <Picker.Item label="Ibuprofen" value="ibuprofen" />
                <Picker.Item label="Amoxicillin" value="amoxicillin" />
              </Picker>
              
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

            {/* Manufacturing Date Calendar Select */}
            <Text style={styles.inputLabel}>Manufacturing Date</Text>
            <View style={styles.inputWrapper}>
              <TouchableOpacity
                style={styles.dateInputButton}
                onPress={() => setShowMfgPicker(true)}
              >
                <Text style={[styles.dateText, !mfgDateSelected && styles.placeholderText]}>
                  {mfgDateSelected ? formatDate(mfgDate) : 'Select Date'}
                </Text>
              </TouchableOpacity>
              {showMfgPicker && (
                <DateTimePicker
                  value={mfgDate}
                  mode="date"
                  display="default"
                  onChange={onChangeMfg}
                />
              )}
            </View>

            {/* Expiry Date Calendar Select */}
            <Text style={styles.inputLabel}>Expiry Date</Text>
            <View style={styles.inputWrapper}>
              <TouchableOpacity
                style={styles.dateInputButton}
                onPress={() => setShowExpPicker(true)}
              >
                <Text style={[styles.dateText, !expDateSelected && styles.placeholderText]}>
                  {expDateSelected ? formatDate(expDate) : 'Select Date'}
                </Text>
              </TouchableOpacity>
              {showExpPicker && (
                <DateTimePicker
                  value={expDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()} // Optional: Prevents selecting past dates for expiry
                  onChange={onChangeExp}
                />
              )}
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
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    paddingTop: 24,
    paddingBottom: 30,
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: '#D1D9D9',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2,
  },
  
  // --- Inputs & Wrappers ---
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
    marginBottom: 20,
    overflow: 'hidden', 
    position: 'relative', // Added to ensure absolute positioning works correctly
  },
  input: { 
    height: 48, 
    textAlign: 'center', 
    color: '#333', 
    fontWeight: '500',
    fontSize: 15
  },
  
  // --- Custom Picker Styles ---
  centeredTextContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, 
  },
  hiddenPicker: {
    height: 48,
    width: '100%',
    opacity: 0, 
    zIndex: 2,
  },

  dateInputButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 15,
  },
  placeholderText: {
    color: '#9AA0A6',
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