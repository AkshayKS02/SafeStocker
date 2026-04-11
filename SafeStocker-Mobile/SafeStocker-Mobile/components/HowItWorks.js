import { StyleSheet, Text, View } from "react-native";

export default function HowItWorks() {
  const steps = ["Add products", "Track stock and expiry", "Get notifications"];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>How It Works</Text>

      <View style={styles.row}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            {/* The Step Item */}
            <View style={styles.step}>
              <View style={styles.circle}>
                <Text style={styles.number}>{index + 1}</Text>
              </View>
              <Text style={styles.text}>{step}</Text>
            </View>

            {/* The Arrow (Rendered after step 1 and 2, but not after the last step) */}
            {index < steps.length - 1 && (
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>
            )}
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
    paddingLeft: 10,
    textAlign: "left",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start", // Changed to align items to the top
    justifyContent: "center",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, 
  },
  step: {
    alignItems: "center",
    flex: 1,
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
  arrowContainer: {
    paddingBottom: 25, // Aligns the arrow vertically with the circles
  },
  arrow: {
    fontSize: 30,
    color: "#5a6cf3",
    fontWeight: "bold",
  },
});