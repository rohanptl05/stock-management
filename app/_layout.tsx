import { UserDetailContext } from "@/context/UserDetailContext";
import { Stack, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserDetail } from "@/context/UserDetailContext";

export default function RootLayout() {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserDetail = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userDetail');
        if (storedUser) {
          setUserDetail(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user data from storage", e);
      } finally {
        setLoading(false);
      }
    };

    loadUserDetail();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (userDetail) {
        router.replace("/(tabs)"); 
      } else {
        router.replace("/auth/signIn"); 
      }
    }
  }, [loading, userDetail]);

  // Persist user detail whenever it changes
  useEffect(() => {
    if (userDetail) {
      AsyncStorage.setItem('userDetail', JSON.stringify(userDetail));
    } else {
      AsyncStorage.removeItem('userDetail');
    }
  }, [userDetail]);

  if (loading) {
    return null; // or a splash/loading screen
  }

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <Stack>
        <Stack.Screen name="auth" options={{ title: "Authentication" }} />
        <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
      </Stack>
    </UserDetailContext.Provider>
  );
}
