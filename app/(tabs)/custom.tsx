import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import JsBarcode from 'jsbarcode';
import { DOMImplementation, XMLSerializer } from 'xmldom';
import { useInventory } from '@/context/InventoryContext';

// Pure-JS barcode generator — no ART, no native deps
function generateBarcodeSvg(value: string): string {
  const document = new DOMImplementation().createDocument(
    'http://www.w3.org/1999/xhtml', 'html', null
  );
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svgNode, value, {
    xmlDocument: document,
    format: 'CODE128',
    width: 2,
    height: 80,
    displayValue: false,
    background: '#EAF0F0',
    lineColor: '#000000',
  });
  return new XMLSerializer().serializeToString(svgNode);
}

export default function CustomScreen() {
  const router = useRouter();
  const { createItem } = useInventory();

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [barcodeSvg, setBarcodeSvg] = useState('');
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateBarcode = () => {
    if (!itemName.trim() || !itemPrice.trim()) {
      Alert.alert("Missing Details", "Please enter a name and price first!");
      return;
    }
    const randomCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const svg = generateBarcodeSvg(randomCode);
    setBarcodeSvg(svg);
    setBarcodeNumber(randomCode);
  };

  const handleSaveItem = async () => {
    const price = Number(itemPrice);

    if (!itemName.trim()) {
      Alert.alert("Missing Details", "Please enter an item name.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price.");
      return;
    }

    if (!barcodeNumber) {
      Alert.alert("Missing Barcode", "Please generate a barcode before saving.");
      return;
    }

    try {
      setIsSaving(true);
      await createItem({
        ItemName: itemName.trim(),
        Barcode: barcodeNumber,
        CategoryID: 1,
        Source: 'CUSTOM',
        Price: price,
      });

      Alert.alert("Saved", "Item registered. Add stock to make it available.");
      setItemName('');
      setItemPrice('');
      setBarcodeSvg('');
      setBarcodeNumber('');
    } catch (error: any) {
      Alert.alert(
        "Save Failed",
        error.response?.data?.error || error.message || "Failed to save item."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tabButton, styles.inactiveTabButton]} onPress={() => router.push('/scan')}>
            <Text style={[styles.tabText, styles.inactiveTabText]}>Standard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, styles.activeTabButton]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Custom</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, styles.inactiveTabButton]} onPress={() => router.push('/add_stock')}>
            <Text style={[styles.tabText, styles.inactiveTabText]}>Add stock</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Custom Items</Text>

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

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleGenerateBarcode}>
                <Text style={styles.primaryButtonText}>Generate Barcode</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, isSaving && styles.disabledButton]}
                onPress={handleSaveItem}
                disabled={isSaving}
              >
                <Text style={styles.secondaryButtonText}>
                  {isSaving ? 'Saving...' : 'Save Item'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Barcode Preview</Text>
            <View style={styles.barcodePlaceholder}>
              {barcodeSvg ? (
                <>
                  <SvgXml xml={barcodeSvg} width="100%" height={100} />
                  <Text style={styles.barcodeNumbers}>{barcodeNumber}</Text>
                </>
              ) : (
                <Text style={{ color: '#999', fontStyle: 'italic', paddingVertical: 30, textAlign: 'center' }}>
                  Fill details and click Generate to see your barcode.
                </Text>
              )}
            </View>
          </View>

        </ScrollView>
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#EAF0F0', borderRadius: 16, paddingTop: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#D1D9D9' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  inputLabel: { fontSize: 12, color: '#5F6368', marginBottom: 6, fontWeight: '500' },
  inputWrapper: { width: '85%', backgroundColor: '#D1D9D9', borderRadius: 8, marginBottom: 20 },
  input: { height: 44, textAlign: 'center', color: '#333', fontWeight: '500', fontSize: 16 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24, marginTop: 10, width: '100%' },
  primaryButton: { backgroundColor: '#4285F4', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, elevation: 2 },
  primaryButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  secondaryButton: { backgroundColor: '#EAF0F0', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderColor: '#707070' },
  secondaryButtonText: { color: '#333', fontWeight: '500', fontSize: 14 },
  disabledButton: { opacity: 0.6 },
  previewCard: { backgroundColor: '#EAF0F0', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#D1D9D9' },
  previewLabel: { color: '#5F6368', fontSize: 18, fontWeight: '500', marginBottom: 20, letterSpacing: 0.5 },
  barcodePlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10, width: '100%' },
  barcodeNumbers: { fontSize: 16, fontWeight: '600', color: '#000', letterSpacing: 4, marginTop: 10 }
});
