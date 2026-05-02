import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Text, View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        header: () => (
          <View
            style={{
              paddingTop: 50,
              paddingBottom: 12,
              alignItems: "center",
              backgroundColor: "#f5f5f5",
            }}
          >
            <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
              <MaskedView
                maskElement={
                  <Text style={{ fontSize: 24, fontWeight: "600" }}>
                    SafeStocker
                  </Text>
                }
              >
                <LinearGradient
                  colors={["#000000", "#4F6EEB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={{ fontSize: 24, fontWeight: "600", opacity: 0 }}>
                    SafeStocker
                  </Text>
                </LinearGradient>
              </MaskedView>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      {/*Hide Home from navbar */}
      <Tabs.Screen name="home" options={{ href: null }} />

      {/*Add */}
      <Tabs.Screen
        name="scan"
        options={{
          title: "Add",
          tabBarIcon: ({ color }) => (
            <Ionicons name="camera" size={28} color={color} />
          ),
        }}
      />

      {/*Dashboard */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart" size={28} color={color} />
          ),
        }}
      />

      {/*Track */}
      <Tabs.Screen
        name="track"
        options={{
          title: "Track",
          tabBarIcon: ({ color }) => (
            <Ionicons name="briefcase" size={28} color={color} />
          ),
        }}
      />

      {/*Billing */}
      <Tabs.Screen
        name="billing"
        options={{
          title: "Billing",
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet" size={28} color={color} />
          ),
        }}
      />

      {/*Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={28} color={color} />
          ),
        }}
      />

      {/*Hide extra screens */}
      <Tabs.Screen name="custom" options={{ href: null }} />
      <Tabs.Screen name="add_stock" options={{ href: null }} />
    </Tabs>
  );
}