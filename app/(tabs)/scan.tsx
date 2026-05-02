import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, ScrollView, Modal, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function ScanScreen() {
  const router = useRouter();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [price, setPrice] = useState('');

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission Required", "Camera access is needed to scan barcodes.");
        return;
      }
    }
    setIsScanning(true);
  };

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    setIsScanning(false);
    setScannedCode(data);
    Alert.alert("Item Scanned!", `Barcode: ${data}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Top Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tabButton, styles.activeTabButton]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Standard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, styles.inactiveTabButton]} onPress={() => router.push('/custom')}>
            <Text style={[styles.tabText, styles.inactiveTabText]}>Custom</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, styles.inactiveTabButton]} onPress={() => router.push('/add_stock')}>
            <Text style={[styles.tabText, styles.inactiveTabText]}>Add stock</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scan Items</Text>
            
            <Text style={styles.inputLabel}>Price</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter Price"
                placeholderTextColor="#9AA0A6"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            {scannedCode ? (
               <Text style={styles.scannedText}>Scanned Code: {scannedCode}</Text>
            ) : null}

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={openScanner}>
                <Text style={styles.primaryButtonText}>Scan Barcode</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Save Item</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />
            <Text style={styles.previewLabel}>Scanner Preview</Text>
            
            <View style={styles.previewBox}>
              <Ionicons name="barcode-outline" size={80} color="#999" />
              <Text style={{ color: '#999', marginTop: 10 }}>Tap 'Scan Barcode' to start</Text>
            </View>
          </View>
        </ScrollView>

        {/* Full Screen Camera Modal */}
        <Modal visible={isScanning} animationType="slide" onRequestClose={() => setIsScanning(false)}>
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
            />
            <View style={styles.overlay}>
              <View style={styles.scanTarget} /> 
              <TouchableOpacity style={styles.closeCameraButton} onPress={() => setIsScanning(false)}>
                <Ionicons name="close-circle" size={50} color="#FFF" />
                <Text style={{color: '#FFF', marginTop: 8, fontWeight: 'bold'}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: 20 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  activeTabButton: { backgroundColor: '#4285F4' },
  inactiveTabButton: { backgroundColor: '#E8F0FE' },
  tabText: { fontSize: 14, fontWeight: '500' },
  activeTabText: { color: '#FFF' },
  inactiveTabText: { color: '#4285F4' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { backgroundColor: '#EAF0F0', borderRadius: 16, paddingTop: 24, paddingBottom: 30, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#D1D9D9' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 16 },
  inputLabel: { fontSize: 12, color: '#5F6368', marginBottom: 8, fontWeight: '500' },
  inputWrapper: { width: '80%', backgroundColor: '#D1D9D9', borderRadius: 8, marginBottom: 24 },
  input: { height: 44, textAlign: 'center', color: '#333', fontWeight: '500', fontSize: 16 },
  scannedText: { color: '#4285F4', fontWeight: 'bold', marginBottom: 16, fontSize: 16 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24, width: '100%' },
  primaryButton: { backgroundColor: '#4285F4', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, elevation: 2 },
  primaryButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  secondaryButton: { backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderColor: '#DADCE0' },
  secondaryButtonText: { color: '#3C4043', fontWeight: '600', fontSize: 14 },
  divider: { width: '100%', height: 1, backgroundColor: '#C4CFCF', marginBottom: 20 },
  previewLabel: { color: '#5F6368', fontSize: 18, fontWeight: '500', marginBottom: 10 },
  previewBox: { alignItems: 'center', justifyContent: 'center', opacity: 0.5 },
  
  // Camera Modal Styles
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  scanTarget: { width: 250, height: 250, borderWidth: 2, borderColor: '#4285F4', backgroundColor: 'transparent', borderRadius: 20, marginBottom: 50 },
  closeCameraButton: { position: 'absolute', bottom: 50, alignItems: 'center' }
});