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
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        
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
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <Ionicons name="camera" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Track',
          tabBarIcon: ({ color }) => <Ionicons name="location" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color }) => <Ionicons name="wallet" size={28} color={color} />,
        }}
      />
      
    </Tabs>
  );
}

// Add state management to CustomHeader
function CustomHeader() {
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  const tabs = [
    { name: 'Home', route: 'index' },
    { name: 'Scan', route: 'scan' },
    { name: 'Track', route: 'track' },
    { name: 'Dashboard', route: 'dashboard' },
    { name: 'Billing', route: 'billing' },
  ];

  const handleTabPress = (route: string) => {
    router.push(`/(tabs)/${route}` as any);
    setSidebarOpen(false);
  };

  return (
    <>
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSidebarOpen(!sidebarOpen)}
        >
          <Ionicons name="menu-outline" size={28} color="#333" />
        </TouchableOpacity>

        <MaskedView
          style={styles.maskedView}
          maskElement={<Text style={styles.headerTitle}>SafeStocker</Text>}
        >
          <LinearGradient
            colors={['#000000', '#4F6EEB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.headerTitle, { opacity: 0 }]}>SafeStocker</Text>
          </LinearGradient>
        </MaskedView>

        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setShowLoginModal(true)}
        >
          <Ionicons name="person-outline" size={24} color="#3b5bfd" />
        </TouchableOpacity>
      </View>

      {sidebarOpen && (
        <View style={styles.sidebar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.route}
              style={styles.sidebarItem}
              onPress={() => handleTabPress(tab.route)}
            >
              <Text style={styles.sidebarText}>{tab.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showLoginModal && (
        <View style={styles.modal}>
          <View style={styles.loginContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowLoginModal(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.loginTitle}>Login</Text>
            {/* Add your login form here */}
          </View>
        </View>
      )}
    </>
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
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  sidebarItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sidebarText: {
    fontSize: 18,
    color: '#333',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  loginContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
});