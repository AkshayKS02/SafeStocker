import React, { useEffect, useMemo, useState } from "react";
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
  Alert,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import BillingProductCard from "../../components/BillingProductCard";
import { useInventory } from "../../context/InventoryContext";

interface InventoryItem {
  ItemID: number;
  ItemName: string;
  Quantity: number;
  Price: number;
  DaysLeft?: number | null;
  Barcode?: string;
}

interface CartState {
  [itemId: string]: number;
}

function buildInvoiceHTML(
  cartItems: Array<InventoryItem & { qty: number }>,
  total: number,
  receiptID: number | string
): string {
  const rows = cartItems
    .map(
      (item) => `
      <tr>
        <td>${item.ItemName}</td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">&#8377;${Number(item.Price).toFixed(2)}</td>
        <td style="text-align:right">&#8377;${(item.Price * item.qty).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8"/>
        <style>
          body { font-family: Helvetica, sans-serif; padding: 32px; color: #111; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          .meta { color: #555; font-size: 13px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f0f4ff; padding: 10px 8px; text-align: left; font-size: 13px; }
          td { padding: 8px; font-size: 13px; border-bottom: 1px solid #eee; }
          .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #333; border-bottom: none; }
        </style>
      </head>
      <body>
        <h1>SafeStocker Invoice</h1>
        <div class="meta">
          Receipt #${receiptID} &nbsp;|&nbsp; ${new Date().toLocaleDateString()}
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th><th style="text-align:center">Qty</th>
              <th style="text-align:right">Price</th><th style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="total-row">
              <td colspan="3">Grand Total</td>
              <td style="text-align:right">&#8377;${Number(total).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>`;
}

export default function BillingScreen() {
  const { inventory, generateInvoice } = useInventory();

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartState>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [billError, setBillError] = useState<string | null>(null);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setIsTyping(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setIsTyping(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  // Aggregate stock by ItemID, exclude expired
  const validItems = useMemo(() => {
    const productMap = new Map<number, InventoryItem>();
    inventory
      .filter((item) => item.DaysLeft == null || item.DaysLeft > 0)
      .forEach((item) => {
        const current = productMap.get(item.ItemID);
        if (current) {
          productMap.set(item.ItemID, { ...current, Quantity: current.Quantity + item.Quantity });
        } else {
          productMap.set(item.ItemID, { ...item });
        }
      });
    return Array.from(productMap.values());
  }, [inventory]);

  const filteredItems = useMemo(
    () => validItems.filter((item) =>
      (item.ItemName || "").toLowerCase().includes(search.toLowerCase())
    ),
    [validItems, search]
  );

  const updateQty = (id: number, type: "add" | "remove") => {
    const key = String(id);
    setCart((prev) => {
      const current = prev[key] || 0;
      const item = validItems.find((p) => p.ItemID === id);
      if (!item) return prev;
      if (type === "add") {
        if (current >= item.Quantity) return prev;
        return { ...prev, [key]: current + 1 };
      }
      return { ...prev, [key]: Math.max(0, current - 1) };
    });
  };

  const cartItems = Object.keys(cart)
    .map((id) => {
      const item = validItems.find((p) => String(p.ItemID) === id);
      return item && cart[id] > 0 ? { ...item, qty: cart[id] } : null;
    })
    .filter((item): item is InventoryItem & { qty: number } => item !== null);

  const total = cartItems.reduce((sum, item) => sum + (item.Price || 0) * item.qty, 0);

  const handleGenerateBill = async () => {
    if (cartItems.length === 0) {
      setBillError("Cart is empty");
      return;
    }

    setBillError(null);
    setIsGeneratingBill(true);

    try {
      // 1. Commit transaction on server, get receipt details back as JSON
      const result = await generateInvoice(
        cartItems.map((item) => ({ itemID: item.ItemID, qty: item.qty }))
      );

      const receiptID = result.receiptID ?? "N/A";

      // 2. Generate PDF locally from HTML
      const html = buildInvoiceHTML(cartItems, total, receiptID);
      const { uri } = await Print.printToFileAsync({ html, base64: false });

      // 3. Share / download
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Invoice #${receiptID}`,
          ...(Platform.OS === "ios" ? { UTI: "com.adobe.pdf" } : {}),
        });
      } else {
        Alert.alert("Saved", `Invoice saved to ${uri}`);
      }

      setCart({});
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        (err instanceof Error ? err.message : "Failed to generate bill");
      setBillError(msg);
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
          placeholderTextColor="#999"
        />

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.ItemID)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {search ? "No products match your search." : "No products in stock."}
            </Text>
          }
          renderItem={({ item }) => (
            <BillingProductCard
              item={{
                name: item.ItemName,
                barcode: item.Barcode || String(item.ItemID),
                price: item.Price,
                qty: cart[String(item.ItemID)] || 0,
              }}
              onAdd={() => updateQty(item.ItemID, "add")}
              onRemove={() => updateQty(item.ItemID, "remove")}
            />
          )}
        />

        {cartItems.length > 0 && !isTyping && (
          <View style={styles.cartSection}>
            <Text style={styles.cartTitle}>Cart</Text>
            <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
              {cartItems.map((item) => (
                <View key={item.ItemID} style={styles.cartItem}>
                  <Text style={styles.cartName}>{item.ItemName}</Text>
                  <Text style={styles.cartQty}>x{item.qty}</Text>
                  <Text style={styles.cartPrice}>₹{(item.Price * item.qty).toFixed(2)}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.separator} />
            {billError && <Text style={styles.errorText}>{billError}</Text>}

            <View style={styles.bottomBar}>
              <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.billBtn, isGeneratingBill && styles.billBtnDisabled]}
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
  container: { flex: 1, padding: 16, backgroundColor: "#F8F9FA" },
  search: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    color: "#111",
  },
  emptyText: { color: "#6B7280", marginTop: 24, textAlign: "center" },
  cartSection: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cartTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  cartList: { maxHeight: 150 },
  cartItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  cartName: { flex: 1, fontSize: 14 },
  cartQty: { width: 40, textAlign: "center" },
  cartPrice: { fontWeight: "600" },
  separator: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 10 },
  errorText: { color: "#E24B4A", fontSize: 12, marginBottom: 10, textAlign: "center" },
  bottomBar: { marginTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { color: "#666", fontSize: 13 },
  totalAmount: { fontSize: 20, fontWeight: "bold" },
  billBtn: { backgroundColor: "#4B7BFF", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  billBtnDisabled: { opacity: 0.6 },
  billBtnText: { color: "#fff", fontWeight: "600" },
});
