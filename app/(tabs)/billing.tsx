import React, { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BillingProductCard from "../../components/BillingProductCard";
import { useInventory } from "../../context/InventoryContext";

// Define the structure of your inventory item for TypeScript
interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  price: number;
  daysLeft: number;
  barcode?: string;
}

interface CartState {
  [itemId: string]: number;
}

export default function BillingScreen() {
  const { inventory } = useInventory();

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartState>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [billError, setBillError] = useState<string | null>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsTyping(true);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsTyping(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Fix: Added explicit type to 'item'
  const validItems = inventory.filter((item: InventoryItem) => item.daysLeft > 0);

  // Fix: Added explicit type to 'item'
  const filteredItems = validItems.filter((item: InventoryItem) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const updateQty = (id: string, type: "add" | "remove"): void => {
    setCart((prev) => {
      const current = prev[id] || 0;
      // Fix: Added explicit type to 'p'
      const item = inventory.find((p: InventoryItem) => p.id === id);
      if (!item) return prev;

      if (type === "add") {
        if (current >= item.stock) return prev;
        return { ...prev, [id]: current + 1 };
      }

      if (type === "remove") {
        return { ...prev, [id]: Math.max(0, current - 1) };
      }

      return prev;
    });
  };

  // Fix: Explicitly typed 'id' and 'p', and used a type guard for the filter
  const cartItems = Object.keys(cart)
    .map((id: string) => {
      const item = inventory.find((p: InventoryItem) => p.id === id);
      return item && cart[id] > 0 ? { ...item, qty: cart[id] } : null;
    })
    .filter((item): item is InventoryItem & { qty: number } => item !== null);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleGenerateBill = async () => {
    try {
      if (cartItems.length === 0) {
        setBillError("Cart is empty");
        return;
      }

      setBillError(null);
      setIsGeneratingBill(true);

      console.log("Generating bill for items:", cartItems);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setCart({});
      console.log("Bill generated successfully");
    } catch (err) {
      setBillError(
        err instanceof Error ? err.message : "Failed to generate bill",
      );
    } finally {
      setIsGeneratingBill(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <TextInput
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          renderItem={({ item }) => (
            <BillingProductCard
              item={{ ...item, qty: cart[item.id] || 0 }}
              onAdd={() => updateQty(item.id, "add")}
              onRemove={() => updateQty(item.id, "remove")}
            />
          )}
        />

        {cartItems.length > 0 && !isTyping && (
          <View style={styles.cartSection}>
            <Text style={styles.cartTitle}>Cart</Text>

            <ScrollView
              style={styles.cartList}
              showsVerticalScrollIndicator={false}
            >
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <Text style={styles.cartName}>{item.name}</Text>
                  <Text style={styles.cartQty}>x{item.qty}</Text>
                  <Text style={styles.cartPrice}>
                    ₹ {item.price * item.qty}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.separator} />

            {billError && <Text style={styles.errorText}>{billError}</Text>}

            <View style={styles.bottomBar}>
              <View>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalAmount}>₹ {total}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.billBtn,
                  isGeneratingBill && styles.billBtnDisabled,
                ]}
                onPress={handleGenerateBill}
                disabled={isGeneratingBill}
              >
                <Text style={styles.billBtnText}>
                  {isGeneratingBill ? "Generating..." : "Generate Bill"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
  },
  search: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },
  cartSection: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  cartList: {
    maxHeight: 150,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cartName: {
    flex: 1,
    fontSize: 14,
  },
  cartQty: {
    width: 40,
    textAlign: "center",
  },
  cartPrice: {
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },
  errorText: {
    color: "#E24B4A",
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
  bottomBar: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: {
    color: "#666",
    fontSize: 13,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  billBtn: {
    backgroundColor: "#4B7BFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  billBtnDisabled: {
    opacity: 0.6,
  },
  billBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});