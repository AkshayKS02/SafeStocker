import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ExpiryCard from "../../components/ExpiryCard";
import { useInventory } from "../../context/InventoryContext";

interface SortButtonProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

function SortButton({ title, active, onPress }: SortButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.sortButton, active && styles.sortButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.sortText, active && styles.sortTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function TrackScreen() {
  const [sortBy, setSortBy] = useState("date");
  const [search, setSearch] = useState("");

  const { inventory } = useInventory();

  const sortedData = [...inventory].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "quantity") return b.stock - a.stock;
    if (sortBy === "date") return a.daysLeft - b.daysLeft;
    return 0;
  });

  const filteredData = sortedData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (itemId: string) => {
    try {
      console.log("Would delete item:", itemId);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search items..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <View style={styles.sortContainer}>
        <SortButton
          title="Name"
          active={sortBy === "name"}
          onPress={() => setSortBy("name")}
        />
        <SortButton
          title="Quantity"
          active={sortBy === "quantity"}
          onPress={() => setSortBy("quantity")}
        />
        <SortButton
          title="Expiry"
          active={sortBy === "date"}
          onPress={() => setSortBy("date")}
        />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpiryCard
            name={item.name}
            barcode={item.barcode}
            stock={item.stock}
            daysLeft={item.daysLeft}
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />
    </View>
  );
}

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
