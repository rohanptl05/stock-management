import React, { useContext } from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/firebaseConfig";
import { UserDetailContext } from "@/context/UserDetailContext";
import type { UserDetail } from "@/context/UserDetailContext";

export default function LogoutButton() {
  const { setUserDetail } = useContext(UserDetailContext);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Firebase sign-out
      setUserDetail(null); // Clear context
      await AsyncStorage.removeItem("userDetail"); // Remove saved session

      Alert.alert("Logged Out", "You have been signed out successfully.");
      router.replace("/auth/signIn"); // Redirect to login/auth screen
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "#E53E3E",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
