import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ExpiryCard from "../../components/ExpiryCard";
import { useInventory } from "../../context/InventoryContext";

export default function TrackScreen() {
  const [sortBy, setSortBy] = useState("date");
  const [search, setSearch] = useState("");
  const { inventory } = useInventory(); // inventory comes from InventoryContext

  const sortedData = [...inventory].sort((a, b) => {
    if (sortBy === "name") return (a.ItemName || "").localeCompare(b.ItemName || "");
    if (sortBy === "quantity") return (b.Quantity || 0) - (a.Quantity || 0);
    // Note: InventoryContext uses ExpiryDate (string), you may need to parse it
    if (sortBy === "date") return (a.ExpiryDate || "").localeCompare(b.ExpiryDate || "");
    return 0;
  });

  const filteredData = sortedData.filter((item) => {
    const query = search.toLowerCase();
    // Safety check: use optional chaining and fallbacks to prevent 'toLowerCase' errors
    const nameMatch = (item.ItemName || "").toLowerCase().includes(query);
    const categoryMatch = (item.Category || "").toLowerCase().includes(query);
    return nameMatch || categoryMatch;
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search inventory..."
        value={search}
        onChangeText={setSearch}
      />
      {/* ... Sort buttons remain same, ensure they call setSortBy ... */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.ItemID.toString()} // Use ItemID from context
        renderItem={({ item }) => (
          <ExpiryCard
            name={item.ItemName}
            barcode={item.Category || "No Category"} 
            stock={item.Quantity}
            daysLeft={10} 
            onDelete={() => {}} 
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
