import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Linking, ImageSourcePropType } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useRouter } from "expo-router"; 

const { width } = Dimensions.get("window");

const data: ImageSourcePropType[] = [
  require("../assets/images/store1.png"),
  require("../assets/images/store2.png"),
  require("../assets/images/store3.png"),
];

export default function HeroCarousel() {
  const router = useRouter(); 

  const handleLearnMore = () => {
    Linking.openURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  };

  return (
    <View style={styles.container}> 
      
      <Carousel
        loop
        width={width}
        height={400}
        autoPlay
        data={data}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <Image source={item as ImageSourcePropType} style={styles.image} />
        )}
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>Track your stock.</Text>
        <Text style={styles.subtitle}>Never miss an expiry again.</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => router.push('/scan')}
          >
            <Text style={styles.primaryText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryBtn} 
            onPress={handleLearnMore}
          >
            <Text style={styles.secondaryText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: 400,
  },
  image: {
    width: "100%",
    height: 400,
  },
  overlay: {
    position: "absolute", 
    bottom: 20,
    left: 20,
    zIndex: 10, 
  },
  title: {
    color: "#f1f2f3",
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.75)', 
    textShadowOffset: { width: -1, height: 1 }, 
    textShadowRadius: 10,
  },
  subtitle: {
    color: "#dddde0",
    marginVertical: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)', 
    textShadowOffset: { width: -1, height: 1 }, 
    textShadowRadius: 10,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  primaryBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    elevation: 8,
  },
  primaryText: {
    color: "#3b5bfd",
    fontWeight: "600",
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 8,
  },
  secondaryText: {
    color: "#fff",
  },
});