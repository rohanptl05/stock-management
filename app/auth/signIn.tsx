import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useContext, useState } from "react";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { UserDetailContext } from "@/context/UserDetailContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignIn = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userDetailContext = useContext(UserDetailContext);
  if (!userDetailContext) {
    throw new Error("SignIn must be used within a UserDetailContext.Provider");
  }
  const { setUserDetail } = userDetailContext;
  const router = useRouter();

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (value: string) => {
      setter(value);
      if (errorMessage) setErrorMessage(null);
    };

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user.emailVerified) {
        // Fetch Firestore user profile
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          console.log("User profile data:", data);

          const userData = {
            uid: user.uid,
            email: user.email,
            role: data.role || null,
            approved: data.approved ?? null,
            hamlet: data.hamlet || null,
          };
          setUserDetail(userData);
          await AsyncStorage.setItem("userDetail", JSON.stringify(userData));

          Alert.alert("Success", "Login Successful!");
          router.push("/(tabs)");
        } else {
          setErrorMessage("User profile not found in database.");
        }
      } else {
        setErrorMessage("Please verify your email before logging in.");
      }

      setEmail("");
      setPassword("");
    } catch (error: any) {
      switch (error.code) {
        case "auth/user-not-found":
          setErrorMessage("No account found with this email.");
          break;
        case "auth/wrong-password":
          setErrorMessage("Incorrect password.");
          break;
        case "auth/invalid-email":
          setErrorMessage("Invalid email address.");
          break;
        default:
          setErrorMessage(`Login failed. Please try again. ${error.message}`);
          break;
      }
    }
  };

  return (
    <SafeAreaView>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Sign In</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={handleInputChange(setEmail)}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={handleInputChange(setPassword)}
          secureTextEntry
          style={styles.input}
        />

        {errorMessage && (
          <Text style={{ color: "red", marginBottom: 10 }}>{errorMessage}</Text>
        )}

        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 20 }}>
          <Text>
            Don’t have an account?{" "}
            <Text
              style={{ color: "blue" }}
              onPress={() => router.push("/auth/signup")}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#3182CE",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16 },
});
