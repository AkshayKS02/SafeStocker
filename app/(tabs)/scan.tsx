import API from "@/app/services/api";
import { useInventory } from "@/context/InventoryContext";
import { useCategories } from "@/hooks/useCategories";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

type ScanResult =
  | { status: "idle" }
  | { status: "found_db"; itemID: number; name: string; barcode: string }
  | { status: "found_api"; name: string; brand: string; barcode: string }
  | { status: "not_found"; barcode: string };

export default function ScanScreen() {
  const router = useRouter();
  const { createItem } = useInventory();

  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [price, setPrice] = useState("");
  const [categoryID, setCategoryID] = useState<number | null>(null);
  const { categories } = useCategories();
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<ScanResult>({ status: "idle" });

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission Required", "Camera access is needed to scan barcodes.");
        return;
      }
    }
    setResult({ status: "idle" });
    setIsScanning(true);
  };

  const handleBarcodeScanned = async ({ data }: { type: string; data: string }) => {
    setIsScanning(false);

    const barcode = (data || "").trim();
    if (!barcode) {
      Alert.alert("Scan Error", "Could not read barcode. Please try again.");
      return;
    }

    try {
      const response = await API.post("/barcode", { barcode });
      const { found, source, product } = response.data;

      if (!found) {
        setResult({ status: "not_found", barcode });
        return;
      }

      if (source === "database") {
        setResult({
          status: "found_db",
          itemID: product.ItemID,
          name: product.name || product.ItemName || "Unknown",
          barcode,
        });
      } else {
        setResult({
          status: "found_api",
          name: product.name || "Unknown Product",
          brand: product.brand || "",
          barcode,
        });
      }
    } catch (err: any) {
      console.error("[ScanScreen] barcode lookup failed:", err?.message);
      // Still allow user to save manually
      setResult({ status: "not_found", barcode });
      Alert.alert("Lookup Failed", "Could not check product database. You can still save it manually.");
    }
  };

  const handleSaveAndAddStock = async () => {
    if (result.status === "idle") return;

    // Already in DB — go straight to add stock, no price needed
    if (result.status === "found_db") {
      router.push("/(tabs)/add_stock");
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price.");
      return;
    }

    const barcode = result.barcode;
    const name =
      result.status === "found_api"
        ? `${result.name}${result.brand ? ` (${result.brand})` : ""}`.trim()
        : `Product ${barcode}`;

    try {
      setIsSaving(true);
      await createItem({
        ItemName: name,
        Barcode: barcode,
        CategoryID: categoryID,
        Source: result.status === "found_api" ? "API" : "BARCODE",
        Price: numericPrice,
      });
      Alert.alert("Saved", "Item registered successfully.", [
        { text: "Add Stock Now", onPress: () => router.push("/(tabs)/add_stock") },
        { text: "Done" },
      ]);
      setResult({ status: "idle" });
      setPrice("");
      setCategoryID(null);
    } catch (err: any) {
      Alert.alert(
        "Save Failed",
        err?.response?.data?.error || err?.message || "Failed to save item."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const scannedBarcode =
    result.status !== "idle" ? result.barcode : null;

  const previewName =
    result.status === "found_db"
      ? result.name
      : result.status === "found_api"
      ? `${result.name}${result.brand ? ` · ${result.brand}` : ""}`
      : result.status === "not_found"
      ? "New product (not in database)"
      : null;

  const actionLabel =
    result.status === "found_db"
      ? "Add Stock →"
      : isSaving
      ? "Saving..."
      : result.status === "idle"
      ? "Save Item"
      : "Save & Add Stock →";



  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tabButton, styles.activeTabButton]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Standard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, styles.inactiveTabButton]}
            onPress={() => router.push("/(tabs)/custom")}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>Custom</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, styles.inactiveTabButton]}
            onPress={() => router.push("/(tabs)/add_stock")}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>Add Stock</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scan Items</Text>

            {/* Price + Category — only needed when saving new item */}
            {result.status !== "found_db" && (
              <>
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

                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.centeredTextContainer} pointerEvents="none">
                    <Text style={[styles.input, styles.pickerText,
                      !categoryID && { color: "#9AA0A6" }]}>
                      {categories.find(c => c.CategoryID === categoryID)?.CategoryName || "Select Category"}
                    </Text>
                  </View>
                  <Picker
                    selectedValue={categoryID}
                    onValueChange={(v) => setCategoryID(v)}
                    style={styles.hiddenPicker}
                    mode="dropdown"
                  >
                    <Picker.Item label="Select Category" value={null} />
                    {categories.map((c) => (
                      <Picker.Item
                        key={c.CategoryName}
                        label={c.CategoryName}
                        value={c.CategoryID}
                      />
                    ))}
                  </Picker>
                </View>
              </>
            )}

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={openScanner}>
                <Text style={styles.primaryButtonText}>Scan Barcode</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, (isSaving || result.status === "idle") && styles.disabledButton]}
                onPress={handleSaveAndAddStock}
                disabled={isSaving || result.status === "idle"}
              >
                <Text style={styles.secondaryButtonText}>{actionLabel}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />
            <Text style={styles.previewLabel}>Scanned Item Details</Text>

            <View style={styles.previewBox}>
              {scannedBarcode ? (
                <>
                  <Text style={styles.itemName}>{previewName}</Text>
                  <Text style={styles.itemCode}>Barcode: {scannedBarcode}</Text>
                </>
              ) : (
                <Text style={styles.placeholder}>Scan an item to see details here</Text>
              )}
            </View>
          </View>
        </ScrollView>

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
                <Text style={{ color: "#FFF", marginTop: 8, fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: 20 },
  tabsContainer: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  activeTabButton: { backgroundColor: "#4285F4" },
  inactiveTabButton: { backgroundColor: "#E8F0FE" },
  tabText: { fontSize: 14, fontWeight: "500" },
  activeTabText: { color: "#FFF" },
  inactiveTabText: { color: "#4285F4" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: "#EAF0F0",
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 30,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D1D9D9",
  },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#000", marginBottom: 16 },
  inputLabel: { fontSize: 12, color: "#5F6368", marginBottom: 8, fontWeight: "500" },
  inputWrapper: { width: "80%", backgroundColor: "#D1D9D9", borderRadius: 8, marginBottom: 24 },
  input: { height: 44, textAlign: "center", color: "#333", fontWeight: "500", fontSize: 16 },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
    width: "100%",
    flexWrap: "wrap",
    paddingHorizontal: 20,
  },
  primaryButton: { backgroundColor: "#4285F4", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, elevation: 2 },
  primaryButtonText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  secondaryButton: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#DADCE0",
  },
  secondaryButtonText: { color: "#3C4043", fontWeight: "600", fontSize: 14 },
  disabledButton: { opacity: 0.6 },
  divider: { width: "100%", height: 1, backgroundColor: "#C4CFCF", marginBottom: 20 },
  previewLabel: { color: "#5F6368", fontSize: 18, fontWeight: "500", marginBottom: 10 },
  previewBox: {
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    width: "90%",
    minHeight: 100,
    justifyContent: "center",
  },
  itemName: { fontSize: 17, fontWeight: "600", color: "#1e293b", textAlign: "center" },
  itemCode: { marginTop: 6, fontSize: 13, color: "#64748b", textAlign: "center" },
  placeholder: { fontSize: 14, color: "#94a3b8" },
  centeredTextContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  hiddenPicker: { height: 44, width: "100%", opacity: 0, zIndex: 2 },
  pickerText: { textAlign: "center" },
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanTarget: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#4285F4",
    backgroundColor: "transparent",
    borderRadius: 20,
    marginBottom: 50,
  },
  closeCameraButton: { position: "absolute", bottom: 50, alignItems: "center" },
});
