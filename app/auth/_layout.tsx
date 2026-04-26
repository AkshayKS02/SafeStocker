import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { InventoryProvider } from "../../context/InventoryContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <InventoryProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
    </InventoryProvider>
  );
}
