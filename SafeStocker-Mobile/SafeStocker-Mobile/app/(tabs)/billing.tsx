// filepath: /Users/adithyan/mad/SafeStocker-Mobile/SafeStocker-Mobile/app/(tabs)/billing.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function BillingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Billing</Text>
      <Text style={styles.subtitle}>Manage your subscription</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});