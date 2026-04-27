import React from "react";
import { Image, StyleSheet, Text, View, ImageSourcePropType } from "react-native";

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: ImageSourcePropType;
}

export default function FeatureCard({ title, desc, icon }: FeatureCardProps) {
  return (
    <View style={styles.card}>
      <Image source={icon} style={styles.icon} />

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  title: {
    fontWeight: "bold",
  },
  desc: {
    color: "#666",
    marginTop: 3,
  },
});