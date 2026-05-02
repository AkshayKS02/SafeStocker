import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FeatureCard from "./FeatureCard";

export default function FeaturesList() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Features</Text>

      <FeatureCard
        title="Add Products"
        desc="Scan barcodes or enter items manually in seconds"
        icon={require("../assets/images/box.png")}
      />

      <FeatureCard
        title="Track Stock"
        desc="Monitor quantity & expiry dates"
        icon={require("../assets/images/chart.png")}
      />

      <FeatureCard
        title="Dashboard"
        desc="View trends & performance"
        icon={require("../assets/images/graph.png")}
      />

      <FeatureCard
        title="Easy Billing"
        desc="Generate invoices seamlessly"
        icon={require("../assets/images/bill.png")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#eef0f5",
  },
  heading: {
    fontWeight: "bold",
    marginBottom: 10,
  },
});