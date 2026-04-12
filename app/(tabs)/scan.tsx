import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router'; // Import Expo Router

export default function ScanScreen() {
  const router = useRouter(); // Initialize router

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Top 3 Buttons / Tabs */}
        <View style={styles.tabsContainer}>
          {/* Standard Button (Active - Current Screen) */}
          <TouchableOpacity
            style={[styles.tabButton, styles.activeTabButton]}
          >
            <Text style={[styles.tabText, styles.activeTabText]}>
              Standard
            </Text>
          </TouchableOpacity>

          {/* Custom Button (Routes to app/(tabs)/custom.tsx) */}
          <TouchableOpacity
            style={[styles.tabButton, styles.inactiveTabButton]}
            onPress={() => router.push('/custom')} 
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>
              Custom
            </Text>
          </TouchableOpacity>

          {/* Add Stock Button (Routes to app/(tabs)/add_stock.tsx) */}
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
          {/* Main Scan Card */}
          <View style={styles.scanCard}>
            <Text style={styles.cardTitle}>Scan Items</Text>
            
            <Text style={styles.cardSubtitle}>Price</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter Price"
                placeholderTextColor="#9AA0A6"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Scan Barcode</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Save Item</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />
            <Text style={styles.previewLabel}>Scanner Preview</Text>
          </View>

          {/* Illustration Placeholder */}
          <View style={styles.illustrationPlaceholder}>
            <View style={styles.mockImage}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>[ QR Scanner Illustration ]</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, backgroundColor: '#ffffff', paddingTop: 20 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  activeTabButton: { backgroundColor: '#4285F4' },
  inactiveTabButton: { backgroundColor: '#E8F0FE' },
  tabText: { fontSize: 14, fontWeight: '500' },
  activeTabText: { color: '#FFF' },
  inactiveTabText: { color: '#4285F4' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  scanCard: { backgroundColor: '#ffffff', borderRadius: 16, paddingTop: 24, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 16 },
  cardSubtitle: { fontSize: 12, color: '#5F6368', marginBottom: 8 },
  inputWrapper: { width: '80%', backgroundColor: '#D1D9D9', borderRadius: 8, marginBottom: 24 },
  input: { height: 40, textAlign: 'center', color: '#333', fontWeight: '500' },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24, width: '100%' },
  primaryButton: { backgroundColor: '#4285F4', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  primaryButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  secondaryButton: { backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderColor: '#DADCE0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  secondaryButtonText: { color: '#3C4043', fontWeight: '600', fontSize: 14 },
  divider: { width: '100%', height: 1, backgroundColor: '#C4CFCF' },
  previewLabel: { paddingVertical: 12, color: '#5F6368', fontSize: 18, fontWeight: '500' },
  illustrationPlaceholder: { alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 40 },
  mockImage: { width: 300, height: 250, backgroundColor: '#BCC1C6', borderRadius: 24, alignItems: 'center', justifyContent: 'center' }
});