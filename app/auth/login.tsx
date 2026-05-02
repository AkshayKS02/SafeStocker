import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/context/AuthContext';
import API from '@/app/services/api';

WebBrowser.maybeCompleteAuthSession();

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://safestocker.onrender.com';

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data;
      await login(user, token);
      router.replace('/(tabs)/home' as any);
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'safestocker',
        path: 'login',
      });
      const authUrl = `${BACKEND_URL}/auth/google?platform=mobile`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type !== 'success') {
        return;
      }

      const parsedUrl = Linking.parse(result.url);
      const token =
        getSingleParam(parsedUrl.queryParams?.token) ??
        getSingleParam(parsedUrl.queryParams?.auth_token);

      if (!token) {
        Alert.alert('Login Failed', 'Google did not return a login token.');
        return;
      }

      await loginWithToken(token);
      router.replace('/(tabs)/home' as any);
    } catch (error) {
      console.error('Auth Error:', error);
      Alert.alert('Error', 'Failed to complete Google login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E3E9FF', '#F8F9FA']} style={styles.blob} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Welcome Back</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="example@mail.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabled]}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, loading && styles.disabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color="#444" style={{ marginRight: 10 }} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  blob: {
    position: 'absolute',
    top: -250,
    left: -200,
    width: 600,
    height: 600,
    borderRadius: 300,
  },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4B7BFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  line: { flex: 1, height: 1, backgroundColor: '#DDD' },
  dividerText: { marginHorizontal: 10, color: '#999', fontWeight: '600' },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: { color: '#444', fontSize: 16, fontWeight: '600' },
  disabled: {
    opacity: 0.6,
  },
});
