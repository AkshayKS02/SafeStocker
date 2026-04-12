import { Tabs, useRouter, usePathname } from 'expo-router';
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  Modal, 
  Pressable 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75; // Sidebar takes up 75% of the screen

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
      
      {/* VISIBLE TABS */}
      <Tabs.Screen
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color }) => <Ionicons name="camera" size={28} color={color} /> }} />
      <Tabs.Screen name="track" options={{ title: 'Track', tabBarIcon: ({ color }) => <Ionicons name="location" size={28} color={color} /> }} />
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={28} color={color} /> }} />
      <Tabs.Screen name="billing" options={{ title: 'Billing', tabBarIcon: ({ color }) => <Ionicons name="wallet" size={28} color={color} /> }} />

      {/* HIDDEN TABS */}
      <Tabs.Screen name="custom" options={{ href: null }} />
      <Tabs.Screen name="add_stock" options={{ href: null }} />
    </Tabs>
  );
}

// Custom Header & Animated Sidebar Component
function CustomHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname(); 

  // Animation & Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Richer tab data including icons for the sidebar UI
  const sidebarItems = [
    { name: 'Home', route: 'home', icon: 'home-outline' as const },
    { name: 'Scan Items', route: 'scan', icon: 'camera-outline' as const },
    { name: 'Track Inventory', route: 'track', icon: 'location-outline' as const },
    { name: 'Dashboard', route: 'dashboard', icon: 'bar-chart-outline' as const },
    { name: 'Billing', route: 'billing', icon: 'wallet-outline' as const },
  ];

  const openSidebar = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      if (callback) callback();
    });
  };

  const handleTabPress = (route: string) => {
    closeSidebar(() => {
      router.push(`/(tabs)/${route}` as any);
    });
  };

  const handleProfileClick = () => {
    router.push({ pathname: '/login', params: { returnTo: pathname } });
  };

  return (
    <>
      {/* MAIN TOP HEADER */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
          <Ionicons name="menu-outline" size={28} color="#333" />
        </TouchableOpacity>

        <MaskedView style={styles.maskedView} maskElement={<Text style={styles.headerTitle}>SafeStocker</Text>}>
          <LinearGradient colors={['#000000', '#4F6EEB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={[styles.headerTitle, { opacity: 0 }]}>SafeStocker</Text>
          </LinearGradient>
        </MaskedView>

        <TouchableOpacity style={styles.profileButton} onPress={handleProfileClick}>
          <Ionicons name="person-outline" size={24} color="#3b5bfd" />
        </TouchableOpacity>
      </View>

      {/* ANIMATED SIDEBAR MODAL */}
      <Modal transparent visible={modalVisible} animationType="none" onRequestClose={() => closeSidebar()}>
        <View style={styles.modalOverlay}>
          
          {/* Dark Fading Backdrop */}
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <Pressable style={styles.backdropPressable} onPress={() => closeSidebar()} />
          </Animated.View>

          {/* Sliding Drawer Panel */}
          <Animated.View style={[styles.drawerContent, { transform: [{ translateX: slideAnim }] }]}>
            
            {/* Sidebar Header Section */}
            <View style={[styles.drawerHeader, { paddingTop: insets.top + 20 }]}>
              <View style={styles.drawerProfilePic}>
                <Ionicons name="person" size={32} color="#4F6EEB" />
              </View>
              <Text style={styles.drawerAppName}>SafeStocker</Text>
              <Text style={styles.drawerAppSubtitle}>Inventory Management</Text>
            </View>

            {/* Sidebar Menu Items */}
            <View style={styles.drawerItemsContainer}>
              {sidebarItems.map((item) => {
                const isActive = pathname.includes(item.route);
                return (
                  <TouchableOpacity 
                    key={item.route} 
                    style={[styles.sidebarItem, isActive && styles.sidebarItemActive]} 
                    onPress={() => handleTabPress(item.route)}
                  >
                    <Ionicons 
                      name={item.icon} 
                      size={24} 
                      color={isActive ? '#4F6EEB' : '#555'} 
                      style={styles.sidebarIcon}
                    />
                    <Text style={[styles.sidebarText, isActive && styles.sidebarTextActive]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sidebar Footer */}
            <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + 20 }]}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleProfileClick}>
                <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // --- Header Styles ---
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff' },
  menuButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center' },
  profileButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DDE8FF', alignItems: 'center', justifyContent: 'center' },
  maskedView: { flex: 1, height: 32, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '600', textAlign: 'center' },
  
  // --- Modal & Backdrop Styles ---
  modalOverlay: { flex: 1, flexDirection: 'row' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  backdropPressable: { flex: 1 },
  
  // --- Drawer Panel Styles ---
  drawerContent: { 
    width: DRAWER_WIDTH, 
    height: '100%', 
    backgroundColor: '#fff', 
    shadowColor: '#000', 
    shadowOffset: { width: 2, height: 0 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    elevation: 5,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  
  // --- Sidebar Header ---
  drawerHeader: { 
    backgroundColor: '#F8F9FA', 
    paddingHorizontal: 24, 
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA'
  },
  drawerProfilePic: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#DDE8FF', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 16
  },
  drawerAppName: { fontSize: 22, fontWeight: '700', color: '#333' },
  drawerAppSubtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  
  // --- Sidebar Menu Items ---
  drawerItemsContainer: { flex: 1, paddingTop: 20 },
  sidebarItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 24,
    marginHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4
  },
  sidebarItemActive: { backgroundColor: '#F0F4FF' },
  sidebarIcon: { marginRight: 16 },
  sidebarText: { fontSize: 16, fontWeight: '500', color: '#555' },
  sidebarTextActive: { color: '#4F6EEB', fontWeight: '700' },
  
  // --- Sidebar Footer ---
  drawerFooter: { 
    borderTopWidth: 1, 
    borderTopColor: '#EAEAEA', 
    paddingTop: 20, 
    paddingHorizontal: 24 
  },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12 
  },
  logoutText: { 
    marginLeft: 12, 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#FF3B30' 
  }
});