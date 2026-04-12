import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // <-- Added useLocalSearchParams
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  // Catch the breadcrumb URL
  const { returnTo } = useLocalSearchParams<{ returnTo: string }>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (returnTo) {
      // Send them exactly back to where they came from
      router.replace(returnTo as any); 
    } else {
      router.replace('/(tabs)/home'); 
    }
  };

  const handleSignUpNavigation = () => {
    // Pass the breadcrumb forward to the Sign Up screen so it isn't lost!
    router.push({
      pathname: '/signup',
      params: { returnTo }
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blob} />
      
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Login</Text>
        
        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your email" 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your password" 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forget password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or Login with</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleButtonText}>Login with Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUpNavigation}>
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    top: -120,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#89b4f8',
    opacity: 0.6,
  },

  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 40,
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

  forgotPassword: {
    color: '#FF4D4D',
    textAlign: 'right',
    marginTop: 12,
    fontWeight: '600',
  },

  loginButton: {
    backgroundColor: '#4B7BFF',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    width: '50%',
    alignSelf: 'center',
  },

  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#CCC',
  },

  dividerText: {
    marginHorizontal: 10,
    color: '#888',
  },

  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },

  footerText: {
    color: '#888',
    fontSize: 14,
  },

  signUpText: {
    color: '#FF4D4D',
    fontSize: 14,
    fontWeight: 'bold',
  },
});