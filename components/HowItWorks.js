import { StyleSheet, Text, View } from "react-native";

export default function HowItWorks() {
  const steps = ["Add products", "Track stock and expiry", "Get notifications"];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>How It works</Text>

      <View style={styles.row}>
        {steps.map((step, index) => (
          <View key={index} style={styles.step}>
            <View style={styles.circle}>
              <Text style={styles.number}>{index + 1}</Text>
            </View>
            <Text style={styles.text}>{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f2f3f7",
  },
  heading: {
    fontWeight: "bold",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  step: {
    alignItems: "center",
    width: "30%",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5a6cf3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  number: {
    color: "#fff",
    fontWeight: "bold",
  },
  text: {
    textAlign: "center",
    fontSize: 12,
  },
});
