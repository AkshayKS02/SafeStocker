import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ExpiryCard from "../../components/ExpiryCard";
import { useInventory, StockItem } from "../../context/InventoryContext";
import { useCategories } from "@/hooks/useCategories";

type SortKey = "date" | "name" | "qty_high" | "qty_low";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "date", label: "Expiry" },
  { key: "name", label: "Name" },
  { key: "qty_high", label: "Qty ↓" },
  { key: "qty_low", label: "Qty ↑" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Grocery: "#FFF3CD",
  Dairy: "#D1ECF1",
  Beverages: "#CCE5FF",
  Snacks: "#FFE5CC",
  "Personal Care": "#F8D7DA",
  Household: "#D4EDDA",
  Electronics: "#E2D9F3",
  Other: "#E9ECEF",
};

const CATEGORY_ICONS: Record<string, string> = {
  Grocery: "basket-outline",
  Dairy: "water-outline",
  Beverages: "cafe-outline",
  Snacks: "pizza-outline",
  "Personal Care": "sparkles-outline",
  Household: "home-outline",
  Electronics: "hardware-chip-outline",
  Other: "cube-outline",
};

export default function TrackScreen() {
  const { inventory, loading, error, removeStock, refreshStock } = useInventory();
  const { categories: dbCategories, loading: catLoading, refresh: refreshCategories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [search, setSearch] = useState("");

  // Map CategoryName → stock items (quantity > 0)
  const categoryMap = useMemo(() => {
    const map = new Map<string, StockItem[]>();
    inventory.forEach((item) => {
      if ((item.Quantity || 0) <= 0) return;
      const cat = (item.CategoryName || "Other").trim() || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    });
    return map;
  }, [inventory]);

  // All categories from DB — show even if count = 0
  // Append any stock-only names (e.g. "Other") not already in DB list
  const allCategories = useMemo(() => {
    const dbNames = dbCategories.map((c) => c.CategoryName);
    const stockOnly = Array.from(categoryMap.keys()).filter(
      (name) => !dbNames.includes(name)
    );
    return [...dbNames, ...stockOnly].sort((a, b) => a.localeCompare(b));
  }, [dbCategories, categoryMap]);

  const itemsInCategory = useMemo(() => {
    if (!selectedCategory) return [];
    const items = categoryMap.get(selectedCategory) || [];
    const filtered = items.filter((item) => {
      const q = search.toLowerCase();
      return (
        (item.ItemName || "").toLowerCase().includes(q) ||
        (item.Barcode || "").toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return (a.ItemName || "").localeCompare(b.ItemName || "");
      if (sortBy === "qty_high") return (b.Quantity || 0) - (a.Quantity || 0);
      if (sortBy === "qty_low") return (a.Quantity || 0) - (b.Quantity || 0);
      return (a.ExpiryDate || "").localeCompare(b.ExpiryDate || "");
    });
  }, [selectedCategory, categoryMap, search, sortBy]);

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
              err?.response?.data?.error || err?.message || "Could not remove stock."
            );
          }
        },
      },
    ]);
  };

  // ── Level 2: Product list inside a category ──────────────────────────────
  if (selectedCategory) {
    return (
      <View style={styles.container}>
        <View style={styles.backRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => { setSelectedCategory(null); setSearch(""); }}
          >
            <Ionicons name="arrow-back" size={20} color="#4285F4" />
            <Text style={styles.backText}>Categories</Text>
          </TouchableOpacity>
          <Text style={styles.categoryTitle}>{selectedCategory}</Text>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search in this category..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.sortContainer}>
          {SORT_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortButton, sortBy === s.key && styles.sortButtonActive]}
              onPress={() => setSortBy(s.key)}
            >
              <Text style={[styles.sortText, sortBy === s.key && styles.sortTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <FlatList
          data={itemsInCategory}
          keyExtractor={(item) => item.StockID.toString()}
          refreshing={loading}
          onRefresh={refreshStock}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? "Loading..." : search ? "No results found." : "No stock in this category."}
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

  // ── Level 1: Category cards ───────────────────────────────────────────────
  const isRefreshing = loading || catLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Inventory</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {allCategories.length === 0 && !isRefreshing ? (
        <Text style={styles.emptyText}>No categories found.</Text>
      ) : (
        <FlatList
          data={allCategories}
          keyExtractor={(item) => item}
          numColumns={2}
          refreshing={isRefreshing}
          onRefresh={async () => { await Promise.all([refreshStock(), refreshCategories()]); }}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item: cat }) => {
            const items = categoryMap.get(cat) || [];
            const bg = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;
            const icon = (CATEGORY_ICONS[cat] || CATEGORY_ICONS.Other) as any;
            return (
              <TouchableOpacity
                style={[styles.categoryCard, { backgroundColor: bg }]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Ionicons name={icon} size={32} color="#374151" />
                <Text style={styles.catName}>{cat}</Text>
                <Text style={styles.catCount}>
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 16 },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 16 },
  grid: { paddingBottom: 24 },
  row: { justifyContent: "space-between", marginBottom: 12 },
  categoryCard: {
    flex: 0.48,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 110,
    gap: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  catName: { fontSize: 15, fontWeight: "700", color: "#1F2937", textAlign: "center" },
  catCount: { fontSize: 12, color: "#6B7280" },
  backRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { color: "#4285F4", fontSize: 15, fontWeight: "500" },
  categoryTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    color: "#111",
  },
  sortContainer: { flexDirection: "row", marginBottom: 14, gap: 8, flexWrap: "wrap" },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4B7BFF",
  },
  sortButtonActive: { backgroundColor: "#4B7BFF" },
  sortText: { color: "#4B7BFF", fontWeight: "500", fontSize: 13 },
  sortTextActive: { color: "#FFF" },
  errorText: { color: "#E24B4A", marginBottom: 8, textAlign: "center" },
  emptyText: { color: "#6B7280", marginTop: 40, textAlign: "center" },
});
