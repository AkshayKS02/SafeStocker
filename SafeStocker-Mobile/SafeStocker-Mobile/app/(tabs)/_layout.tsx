import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';


function CustomHeader() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
      
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="menu-outline" size={28} color="#333" />
      </TouchableOpacity>

      <MaskedView
        style={styles.maskedView}
        maskElement={<Text style={styles.headerTitle}>SafeStocker</Text>}
      >
        <LinearGradient
          colors={['#000000', '#4F6EEB']} // Cyan to deep blue
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.headerTitle, { opacity: 0 }]}>SafeStocker</Text>
        </LinearGradient>
      </MaskedView>

      {/* 3. Profile Icon Button */}
      <TouchableOpacity style={styles.profileButton}>
        <Ionicons name="person-outline" size={24} color="#3b5bfd" />
      </TouchableOpacity>
      
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        
        // Inject the custom header here
        header: () => <CustomHeader />,
        headerShown: true, 
        
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DDE8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskedView: {
    flex: 1,
    height: 32, // Important: must have a fixed height for MaskedView
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
     // Adjust for better centering with the menu button
  },
});