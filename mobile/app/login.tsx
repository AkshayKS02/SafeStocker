import { useAuth } from '@/context/AuthContext';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default function LoginCallback() {
  const { token, auth_token: authToken } = useLocalSearchParams<{
    token?: string | string[];
    auth_token?: string | string[];
  }>();
  const { loginWithToken } = useAuth();
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const handledTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const callbackToken = getSingleParam(token) ?? getSingleParam(authToken);

    if (!callbackToken) {
      setRedirectToLogin(true);
      return;
    }

    if (handledTokenRef.current === callbackToken) {
      return;
    }

    handledTokenRef.current = callbackToken;
    loginWithToken(callbackToken)
      .then(() => setRedirectToHome(true))
      .catch((error) => {
        console.error('Login callback error:', error);
        setRedirectToLogin(true);
      });
  }, [authToken, loginWithToken, token]);

  if (redirectToHome) {
    return <Redirect href="/(tabs)/home" />;
  }

  if (redirectToLogin) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4B7BFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    flex: 1,
    justifyContent: 'center',
  },
});
