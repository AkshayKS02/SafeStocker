import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HowItWorks() {
  const steps = [
    "Add\nproducts",
    "Track stock\nand expiry",
    "Get\nnotifications",
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>How It works</Text>

      <View style={styles.timelineContainer}>
        {/* Continuous horizontal line positioned behind the circles */}
        <View style={styles.connectingLine} />

        <View style={styles.row}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              {/* Wrapper to keep circles centered on the line */}
              <View style={styles.circleWrapper}>
                <View style={styles.circle}>
                  <Text style={styles.number}>{index + 1}</Text>
                </View>
              </View>
              <Text style={styles.text}>{step}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: "#ffffff",
  },
  heading: {
    paddingLeft: 20,
    textAlign: "left",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#000",
    zIndex: 1,
  },
  timelineContainer: {
    position: "relative",
    paddingHorizontal: 10,
    zIndex: 1,
  },
  connectingLine: {
    position: "absolute",
    top: 25, // Exactly half of circleWrapper height (50) to center the line
    left: "18%", 
    right: "18%", 
    height: 2,
    backgroundColor: "#d5dadf",
    zIndex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  stepContainer: {
    flex: 1,
    alignItems: "center",
    zIndex: 2,
  },
  circleWrapper: {
    height: 50, // Matches the circle height perfectly
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#507af5", 
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 20,
  },
  text: {
    textAlign: "center",
    fontSize: 14,
    color: "#1a1a1a",
    lineHeight: 20, 
  },
});