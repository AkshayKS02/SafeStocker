import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function RootIndex() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible || isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.splashLogo}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  splashLogo: {
    width: "80%",
    height: 150,
  },
});
