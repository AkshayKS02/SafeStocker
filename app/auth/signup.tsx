import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();
  // Catch the breadcrumb passed from the login screen
  const { returnTo } = useLocalSearchParams<{ returnTo: string }>();

  const handleSignUp = () => {
    if (returnTo) {
      // Send them exactly back to where they started the journey
      router.replace(returnTo as any);
    } else {
      router.replace("/(tabs)/home");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#3E82FF", "#F5F5F5"]} // darker → lighter like your image
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.blob}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Sign Up</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} placeholder="Enter your name" />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Password"
          secureTextEntry
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password again"
          secureTextEntry
        />

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  blob: {
    position: "absolute",
    zIndex: -1,
    top: -250,
    left: -200,
    width: 600,
    height: 600,
    borderRadius: 300,
  },

  content: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 50,
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },

  signUpButton: {
    backgroundColor: "#4B7BFF",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 40,
    width: "50%",
    alignSelf: "center",
  },

  signUpButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
