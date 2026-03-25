import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const data = [
  require("../assets/images/store1.png"),
  require("../assets/images/store2.png"),
  require("../assets/images/store3.png"),
];

export default function HeroCarousel() {
  return (
    <View>
      <Carousel
        loop
        width={width}
        height={300}
        autoPlay
        data={data}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item} style={styles.image} />

            <View style={styles.overlay}>
              <Text style={styles.title}>Track your stock.</Text>
              <Text style={styles.subtitle}>Never miss an expiry again.</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryBtn}>
                  <Text style={styles.primaryText}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn}>
                  <Text style={styles.secondaryText}>Learn More</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 300,
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#ddd",
    marginVertical: 5,
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
  },
  secondaryText: {
    color: "#fff",
  },
});
