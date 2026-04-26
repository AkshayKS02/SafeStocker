import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomItemFormData {
  name: string;
  price: string;
}

export default function CustomScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState<CustomItemFormData>({
    name: "",
    price: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barcodeData, setBarcodeData] = useState<string | null>(null);

  const handleFormChange = (key: keyof CustomItemFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleGenerateBarcode = async () => {
    if (!formData.name.trim()) {
      setError("Item name is required");
      return;
    }

    try {
      setError(null);
      // TODO: Integrate actual barcode generation library
      // For now, generate a mock barcode
      const mockBarcode = Math.random().toString().slice(2, 15);
      setBarcodeData(mockBarcode);
      console.log("Generated barcode:", mockBarcode);
    } catch (err) {
      setError("Failed to generate barcode");
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Item name is required";
    if (!formData.price.trim()) return "Price is required";
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      return "Price must be a valid number";
    }
    return null;
  };

  const handleSaveItem = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // TODO: Replace with actual API call
      console.log("Saving custom item:", {
        ...formData,
        price: parseFloat(formData.price),
        barcode: barcodeData,
      });

      // Simulated API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Reset on success
      setFormData({ name: "", price: "" });
      setBarcodeData(null);
      console.log("Item saved successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item");
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
            onPress={() => router.push("/(tabs)/scan")}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>
              Standard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabButton, styles.activeTabButton]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Custom</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, styles.inactiveTabButton]}
            onPress={() => router.push("/(tabs)/add_stock")}
          >
            <Text style={[styles.tabText, styles.inactiveTabText]}>
              Add stock
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Message */}
          {error && <Text style={styles.errorText}>{error}</Text>}

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
                value={formData.name}
                onChangeText={(value) => handleFormChange("name", value)}
              />
            </View>

            {/* Price Input */}
            <Text style={styles.inputLabel}>Price</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter Price"
                placeholderTextColor="#9AA0A6"
                keyboardType="decimal-pad"
                value={formData.price}
                onChangeText={(value) => handleFormChange("price", value)}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleGenerateBarcode}
              >
                <Text style={styles.primaryButtonText}>Generate Barcode</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  isLoading && styles.secondaryButtonDisabled,
                ]}
                onPress={handleSaveItem}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>
                  {isLoading ? "Saving..." : "Save Item"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Barcode Preview Card */}
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Barcode Preview</Text>

            {barcodeData ? (
              <View style={styles.barcodePlaceholder}>
                <Text style={styles.barcodeMockText}>||||| || ||||</Text>
                <Text style={styles.barcodeNumbers}>{barcodeData}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>
                Generate a barcode to see preview
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: "#4285F4",
  },
  inactiveTabButton: {
    backgroundColor: "#E8F0FE",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFF",
  },
  inactiveTabText: {
    color: "#4285F4",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  errorText: {
    color: "#E24B4A",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 30,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D1D9D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    color: "#5F6368",
    marginBottom: 6,
    fontWeight: "500",
  },
  inputWrapper: {
    width: "85%",
    backgroundColor: "#D1D9D9",
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    height: 44,
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
    marginTop: 10,
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "#EAF0F0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#707070",
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    color: "#333",
    fontWeight: "500",
    fontSize: 14,
  },
  previewCard: {
    backgroundColor: "#EAF0F0",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D9D9",
  },
  previewLabel: {
    color: "#5F6368",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  barcodePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  barcodeMockText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 2,
    marginBottom: 10,
  },
  barcodeNumbers: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    letterSpacing: 4,
  },
  placeholderText: {
    color: "#9AA0A6",
    fontSize: 14,
    textAlign: "center",
  },
});
