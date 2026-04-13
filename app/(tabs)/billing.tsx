import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';

import { useInventory } from '../../context/InventoryContext';
import BillingProductCard from '../../components/BillingProductCard';

export default function BillingScreen() {
  const { inventory } = useInventory();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isTyping, setIsTyping] = useState(false);

  // ✅ Keyboard listener (FIXED)
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setIsTyping(true);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsTyping(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ✅ only non-expired
  const validItems = inventory.filter(item => item.daysLeft > 0);

  // ✅ search
  const filteredItems = validItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ quantity logic with stock limit
  const updateQty = (id: string, type: 'add' | 'remove') => {
    setCart(prev => {
      const current = prev[id] || 0;
      const item = inventory.find(p => p.id === id);
      if (!item) return prev;

      if (type === 'add') {
        if (current >= item.stock) return prev;
        return { ...prev, [id]: current + 1 };
      }

      if (type === 'remove') {
        return { ...prev, [id]: Math.max(0, current - 1) };
      }

      return prev;
    });
  };

  // ✅ cart items
  const cartItems = Object.keys(cart)
    .map(id => {
      const item = inventory.find(p => p.id === id);
      return item && cart[id] > 0
        ? { ...item, qty: cart[id] }
        : null;
    })
    .filter(Boolean) as any[];

  // ✅ total
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>

        {/* 🔍 Search */}
        <TextInput
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        {/* 🧾 Product List */}
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          renderItem={({ item }) => (
            <BillingProductCard
              item={{ ...item, qty: cart[item.id] || 0 }}
              onAdd={() => updateQty(item.id, 'add')}
              onRemove={() => updateQty(item.id, 'remove')}
            />
          )}
        />

        {/* 🛒 Cart Section (hidden ONLY when keyboard open) */}
        {cartItems.length > 0 && !isTyping && (
          <View style={styles.cartSection}>
            <Text style={styles.cartTitle}>Cart</Text>

            <ScrollView
              style={styles.cartList}
              showsVerticalScrollIndicator={false}
            >
              {cartItems.map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <Text style={styles.cartName}>{item.name}</Text>
                  <Text style={styles.cartQty}>x{item.qty}</Text>
                  <Text style={styles.cartPrice}>
                    ₹ {item.price * item.qty}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* 🔹 Separator */}
            <View style={styles.separator} />

            {/* 💰 Bottom */}
            <View style={styles.bottomBar}>
              <View>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalAmount}>₹ {total}</Text>
              </View>

              <TouchableOpacity style={styles.billBtn}>
                <Text style={styles.billBtnText}>Generate Bill</Text>
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
    backgroundColor: '#F8F9FA',
  },

  search: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },

  cartSection: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  cartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  cartList: {
    maxHeight: 150,
  },

  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  cartName: {
    flex: 1,
    fontSize: 14,
  },

  cartQty: {
    width: 40,
    textAlign: 'center',
  },

  cartPrice: {
    fontWeight: '600',
  },

  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },

  bottomBar: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalText: {
    color: '#666',
    fontSize: 13,
  },

  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  billBtn: {
    backgroundColor: '#4B7BFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  billBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});