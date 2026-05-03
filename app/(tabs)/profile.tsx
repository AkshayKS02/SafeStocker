import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  FlatList,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

interface Supplier {
  id: string;
  name: string;
  phone: string;
}

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const profilePicture = user?.picture?.trim();
  const [profile, setProfile] = useState({
    name: user?.OwnerName || "",
    email: user?.Email || "",
    address: "",
  });

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const supplierStorageKey = user?.ShopID ? `suppliers_${user.ShopID}` : null;

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user?.OwnerName || "",
      email: user?.Email || "",
    }));
  }, [user?.Email, user?.OwnerName]);

  useEffect(() => {
    let mounted = true;

    const loadSuppliers = async () => {
      if (!supplierStorageKey) {
        setSuppliers([]);
        return;
      }

      const saved = await SecureStore.getItemAsync(supplierStorageKey);
      if (mounted) {
        setSuppliers(saved ? JSON.parse(saved) : []);
      }
    };

    loadSuppliers().catch(() => {
      if (mounted) setSuppliers([]);
    });

    return () => {
      mounted = false;
    };
  }, [supplierStorageKey]);

  const saveSuppliers = useCallback(
    async (nextSuppliers: Supplier[]) => {
      setSuppliers(nextSuppliers);
      if (supplierStorageKey) {
        await SecureStore.setItemAsync(
          supplierStorageKey,
          JSON.stringify(nextSuppliers)
        );
      }
    },
    [supplierStorageKey]
  );

  const addSupplier = async () => {
    if (!newName || !newPhone) return;
    if (suppliers.length >= 10) return;

    const newSupplier: Supplier = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
    };

    await saveSuppliers([...suppliers, newSupplier]);
    setNewName("");
    setNewPhone("");
    setModalVisible(false);
  };

  const deleteSupplier = async (id: string) => {
    await saveSuppliers(suppliers.filter((s) => s.id !== id));
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };
  const ListHeader = () => (
    <View>
      <View style={styles.avatarContainer}>
        <View style={styles.defaultAvatarCircle}>
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              style={styles.profileAvatarImage}
            />
          ) : (
            <Ionicons name="person" size={54} color="#9CA3AF" />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <TextInput
          placeholder="Name"
          value={profile.name}
          style={styles.input}
          editable={false}
        />
        <TextInput
          placeholder="Email"
          value={profile.email}
          style={styles.input}
          editable={false}
        />
        <TextInput
          placeholder="Address"
          value={profile.address}
          onChangeText={(text) => setProfile((prev) => ({ ...prev, address: text }))}
          style={styles.input}
        />
      </View>

      <View style={styles.settingsRow}>
        <View>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Text style={styles.settingSubtext}>Alerts for stock expiry</Text>
        </View>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={setIsNotificationsEnabled}
          trackColor={{ false: "#D1D5DB", true: "#4F6EEB" }}
          thumbColor="#fff"
        />
      </View>

      {/* Logout Button moved above Suppliers */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => {
          Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log Out", style: "destructive", onPress: handleLogout },
          ]);
        }}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.supplierHeader}>
        <View>
          <Text style={styles.sectionTitle}>Suppliers</Text>
          <Text style={styles.countText}>{suppliers.length}/10 slots</Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, suppliers.length >= 10 && styles.disabledBtn]}
          onPress={() => setModalVisible(true)}
          disabled={suppliers.length >= 10}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.supplierCard}>
            <View style={styles.supplierInfo}>
              <View style={styles.avatarMini}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.supplierName}>{item.name}</Text>
                <Text style={styles.supplierPhone}>{item.phone}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="call-outline" size={18} color="#4F6EEB" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => deleteSupplier(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#E53935" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Supplier</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                placeholder="Supplier Name"
                value={newName}
                onChangeText={setNewName}
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInput
                placeholder="Contact Number"
                value={newPhone}
                onChangeText={setNewPhone}
                style={styles.input}
                keyboardType="phone-pad"
              />

              <TouchableOpacity style={styles.saveBtn} onPress={addSupplier}>
                <Text style={styles.saveText}>Save Supplier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  defaultAvatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  profileAvatarImage: {
    width: "100%",
    height: "100%",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 15,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  settingSubtext: {
    fontSize: 12,
    color: "#6B7280",
  },
  logoutBtn: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    marginBottom: 20,
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 24,
  },
  supplierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  countText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F6EEB",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  disabledBtn: {
    backgroundColor: "#D1D5DB",
  },
  addText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  supplierCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  supplierInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#4F6EEB",
    fontWeight: "bold",
    fontSize: 14,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  supplierPhone: {
    fontSize: 12,
    color: "#6B7280",
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "700",
  },
  modalBody: {
    gap: 2,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
    marginLeft: 2,
  },
  saveBtn: {
    backgroundColor: "#4F6EEB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
