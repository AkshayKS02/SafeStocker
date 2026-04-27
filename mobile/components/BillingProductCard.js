import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function BillingProductCard({ item, onAdd, onRemove }) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.barcode}>{item.barcode}</Text>
        <Text style={styles.price}>₹ {item.price}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={onRemove} style={styles.btn}>
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.qty}>{item.qty}</Text>

        <TouchableOpacity onPress={onAdd} style={styles.btn}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  barcode: {
    fontSize: 12,
    color: '#777',
  },
  price: {
    fontSize: 14,
    color: '#4B7BFF',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btn: {
    backgroundColor: '#4B7BFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
  },
  qty: {
    fontSize: 16,
    fontWeight: '600',
  },
});