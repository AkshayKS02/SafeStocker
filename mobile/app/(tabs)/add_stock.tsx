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
import { useInventory } from '@/context/InventoryContext';

// Type definitions
interface AddStockFormData {
  item: string;
  quantity: string;
  mfgDate: Date;
  expDate: Date;
}

interface PickerState {
  mfg: { show: boolean; selected: boolean };
  exp: { show: boolean; selected: boolean };
}

export default function AddStockScreen() {
  const router = useRouter();
  const { products, addStock, refreshItems } = useInventory();

  // Form state
  const [formData, setFormData] = useState<AddStockFormData>({
    item: '',
    quantity: '',
    mfgDate: new Date(),
    expDate: new Date(),
  });

  // UI state
  const [pickerState, setPickerState] = useState<PickerState>({
    mfg: { show: false, selected: false },
    exp: { show: false, selected: false },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleFormChange = (key: keyof AddStockFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setError(null); // Clear error on input change
  };

  const formatDate = (date: Date) => date.toLocaleDateString();
  const toApiDate = (date: Date) => date.toISOString().split('T')[0];

  React.useEffect(() => {
    refreshItems().catch(() => {});
  }, [refreshItems]);

  const handleMfgDateChange = (event: any, selectedDate?: Date) => {
    setPickerState(prev => ({
      ...prev,
      mfg: { show: Platform.OS === 'ios', selected: true },
    }));
    if (selectedDate) {
      handleFormChange('mfgDate', selectedDate);
    }
  };

  const handleExpDateChange = (event: any, selectedDate?: Date) => {
    setPickerState(prev => ({
      ...prev,
      exp: { show: Platform.OS === 'ios', selected: true },
    }));
    if (selectedDate) {
      handleFormChange('expDate', selectedDate);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.item) return 'Please select an item';
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      return 'Please enter a valid quantity';
    }
    if (!pickerState.mfg.selected) return 'Please select manufacturing date';
    if (!pickerState.exp.selected) return 'Please select expiry date';
    if (formData.expDate <= formData.mfgDate) {
      return 'Expiry date must be after manufacturing date';
    }
    return null;
  };

  const handleUpdateStock = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      await addStock({
        ItemID: Number(formData.item),
        Quantity: Number(formData.quantity),
        ManufactureDate: toApiDate(formData.mfgDate),
        ExpiryDate: toApiDate(formData.expDate),
      });

      // Reset form on success
      setFormData({
        item: '',
        quantity: '',
        mfgDate: new Date(),
        expDate: new Date(),
      });
      setPickerState({
        mfg: { show: false, selected: false },
        exp: { show: false, selected: false },
      });
      
      setError('Stock added successfully');
    } catch (err) {
      setError(
        (err as any)?.response?.data?.error ||
          (err instanceof Error ? err.message : 'Failed to update stock')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top 3 Buttons / Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, styles.inactiveTabButton]}
            onPress={() => router.push('/(tabs)/scan')}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>Standard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, styles.inactiveTabButton]}
            onPress={() => router.push('/(tabs)/custom')}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>Custom</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, styles.activeTabButton]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Add stock</Text>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <Text style={styles.pageTitle}>Update Stock</Text>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Error Message */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Main Form Card */}
          <View style={styles.card}>
            {/* Item Dropdown */}
            <Text style={styles.inputLabel}>Item</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.centeredTextContainer} pointerEvents="none">
                <Text style={[styles.dateText, !formData.item && styles.placeholderText]}>
                  {formData.item
                    ? products.find((item) => String(item.ItemID) === formData.item)?.ItemName || 'Select Item'
                    : 'Select Item'}
                </Text>
              </View>
              <Picker
                selectedValue={formData.item}
                onValueChange={(value) => handleFormChange('item', value)}
                style={styles.hiddenPicker}
                mode="dropdown"
              >
                <Picker.Item label="Select Item" value="" />
                {products.map((item) => (
                  <Picker.Item
                    key={item.ItemID}
                    label={item.ItemName}
                    value={String(item.ItemID)}
                  />
                ))}
              </Picker>
            </View>

            {/* Quantity Input */}
            <Text style={styles.inputLabel}>Quantity</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter Quantity"
                placeholderTextColor="#9AA0A6"
                keyboardType="numeric"
                value={formData.quantity}
                onChangeText={(value) => handleFormChange('quantity', value)}
              />
            </View>

            {/* Manufacturing Date */}
            <Text style={styles.inputLabel}>Manufacturing Date</Text>
            <View style={styles.inputWrapper}>
              <TouchableOpacity
                style={styles.dateInputButton}
                onPress={() => setPickerState(prev => ({ ...prev, mfg: { ...prev.mfg, show: true } }))}
              >
                <Text style={[styles.dateText, !pickerState.mfg.selected && styles.placeholderText]}>
                  {pickerState.mfg.selected ? formatDate(formData.mfgDate) : 'Select Date'}
                </Text>
              </TouchableOpacity>
              {pickerState.mfg.show && (
                <DateTimePicker
                  value={formData.mfgDate}
                  mode="date"
                  display="default"
                  onChange={handleMfgDateChange}
                />
              )}
            </View>

            {/* Expiry Date */}
            <Text style={styles.inputLabel}>Expiry Date</Text>
            <View style={styles.inputWrapper}>
              <TouchableOpacity
                style={styles.dateInputButton}
                onPress={() => setPickerState(prev => ({ ...prev, exp: { ...prev.exp, show: true } }))}
              >
                <Text style={[styles.dateText, !pickerState.exp.selected && styles.placeholderText]}>
                  {pickerState.exp.selected ? formatDate(formData.expDate) : 'Select Date'}
                </Text>
              </TouchableOpacity>
              {pickerState.exp.show && (
                <DateTimePicker
                  value={formData.expDate}
                  mode="date"
                  display="default"
                  minimumDate={formData.mfgDate}
                  onChange={handleExpDateChange}
                />
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
              onPress={handleUpdateStock}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Updating...' : 'Update Stock'}
              </Text>
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
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#4285F4',
  },
  inactiveTabButton: {
    backgroundColor: '#E8F0FE',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
  },
  inactiveTabText: {
    color: '#4285F4',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  errorText: {
    color: '#E24B4A',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
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
  inputLabel: {
    fontSize: 13,
    color: '#5F6368',
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrapper: {
    width: '85%',
    backgroundColor: '#D1D9D9',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  input: {
    height: 48,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
    fontSize: 15,
  },
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
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
