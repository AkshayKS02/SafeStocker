import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import API from '@/app/services/api';

export default function SignUpScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim()) return 'Name is required';
    if (!email.trim()) return 'Email is required';
    if (!password.trim()) return 'Password is required';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSignUp = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Error', error);
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/signup', {
        OwnerName: name,
        Email: email,
        Password: password,
      });

      const { user, token } = response.data;
      await login(user, token);
      router.replace('/(tabs)/home' as any);
    } catch (error: any) {
      Alert.alert(
        'Sign Up Failed',
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to create account'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3E82FF', '#F5F5F5']}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.blob}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Sign Up</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.signUpButton, loading && styles.disabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.signUpButtonText}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  blob: {
    position: 'absolute',
    zIndex: -1,
    top: -250,
    left: -200,
    width: 600,
    height: 600,
    borderRadius: 300,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 10,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 50,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: '#4B7BFF',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 40,
    width: '50%',
    alignSelf: 'center',
  },
  signUpButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.6,
  },
});
