import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Set headerShown: false on the whole stack so we don't get ugly default top-bars on our login screens */}
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* 1. The Splash Screen (loads first because its name is "index") */}
        <Stack.Screen name="index" />
        
        {/* 2. Authentication Screens */}
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        
        {/* 3. The Main App (Tabs) */}
        <Stack.Screen name="(tabs)" />
        
        {/* 4. The Modal from your original template (we turn the header back on just for this one) */}
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            title: 'Modal',
            headerShown: true 
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}