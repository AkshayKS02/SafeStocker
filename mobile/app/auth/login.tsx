import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoginParams {
  returnTo?: string;
  [key: string]: string | string[] | undefined;
}

export default function LoginScreen() {
  const router = useRouter();

  const { returnTo } = useLocalSearchParams<LoginParams>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/home");
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      // Logic for authentication goes here

      if (returnTo) {
        router.replace(returnTo as any);
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (err) {
      setError("Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={28} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/auth/signup" as any,
              params: { returnTo },
            })
          }
        >
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text style={styles.footerLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  closeButton: { padding: 16 },
  content: { padding: 24, justifyContent: "center", flex: 1 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 24 },
  label: { fontSize: 16, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  errorText: { color: "red", marginBottom: 10 },
  loginButton: {
    backgroundColor: "#4B7BFF",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 30,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  footerText: { textAlign: "center", marginTop: 20, color: "#666" },
  footerLink: { color: "#4B7BFF", fontWeight: "bold" },
});
