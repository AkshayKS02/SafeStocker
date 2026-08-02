import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Linking from 'expo-linking';

function getSingleQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function DeepLinkHandler() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const handledUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (handledUrlRef.current === url) {
        return;
      }

      try {
        const parsedUrl = Linking.parse(url);
        const token =
          getSingleQueryValue(parsedUrl.queryParams?.token) ??
          getSingleQueryValue(parsedUrl.queryParams?.auth_token);

        if (typeof token === 'string' && token.length > 0) {
          handledUrlRef.current = url;
          await loginWithToken(token);
          router.replace('/(tabs)/home');
        }
      } catch (error) {
        console.error('Deep link error:', error);
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url != null) {
        handleDeepLink(url);
      }
    });

    return () => subscription.remove();
  }, [loginWithToken, router]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <InventoryProvider>
        <DeepLinkHandler />
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </ThemeProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}
