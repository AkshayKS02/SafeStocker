import React, { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ExpiryCard from "../../components/ExpiryCard";
import { useInventory } from "../../context/InventoryContext";

export default function TrackScreen() {
  const [sortBy, setSortBy] = useState("date");
  const [search, setSearch] = useState("");
  const { inventory, loading, error, removeStock, refreshStock } = useInventory();

  const sortedData = [...inventory].sort((a, b) => {
    if (sortBy === "name") return (a.ItemName || "").localeCompare(b.ItemName || "");
    if (sortBy === "quantity") return (b.Quantity || 0) - (a.Quantity || 0);
    if (sortBy === "date") return (a.ExpiryDate || "").localeCompare(b.ExpiryDate || "");
    return 0;
  });

  const filteredData = sortedData.filter((item) => {
    const query = search.toLowerCase();
    // Safety check: use optional chaining and fallbacks to prevent 'toLowerCase' errors
    const nameMatch = (item.ItemName || "").toLowerCase().includes(query);
    const categoryMatch = (item.CategoryName || "").toLowerCase().includes(query);
    return nameMatch || categoryMatch;
  });

  const confirmDelete = (stockID: number) => {
    Alert.alert("Remove Stock", "Remove this stock batch from inventory?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removeStock(stockID);
          } catch (err: any) {
            Alert.alert(
              "Remove Failed",
              err.response?.data?.error || err.message || "Could not remove stock."
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search inventory..."
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.sortContainer}>
        {[
          { key: "date", label: "Date" },
          { key: "name", label: "Name" },
          { key: "quantity", label: "Quantity" },
        ].map((sort) => (
          <TouchableOpacity
            key={sort.key}
            style={[styles.sortButton, sortBy === sort.key && styles.sortButtonActive]}
            onPress={() => setSortBy(sort.key)}
          >
            <Text style={[styles.sortText, sortBy === sort.key && styles.sortTextActive]}>
              {sort.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.StockID.toString()}
        refreshing={loading}
        onRefresh={refreshStock}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? "Loading inventory..." : "No stock found."}
          </Text>
        }
        renderItem={({ item }) => (
          <ExpiryCard
            name={item.ItemName}
            barcode={item.Barcode || String(item.ItemID)}
            stock={item.Quantity}
            daysLeft={item.DaysLeft ?? 999}
            onDelete={() => confirmDelete(item.StockID)}
          />
        )}
      />
    </View>
  );
}

// ... styles remain the same ...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },

  search: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },

  errorText: {
    color: "#E24B4A",
    marginBottom: 8,
    textAlign: "center",
  },

  emptyText: {
    color: "#6B7280",
    marginTop: 24,
    textAlign: "center",
  },

  sortContainer: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 10,
  },

  sortButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4B7BFF",
  },

  sortButtonActive: {
    backgroundColor: "#4B7BFF",
  },

  sortText: {
    color: "#4B7BFF",
    fontWeight: "500",
  },

  sortTextActive: {
    color: "#FFFFFF",
  },
});
