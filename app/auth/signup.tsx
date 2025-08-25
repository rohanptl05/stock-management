import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useState } from "react";
import { Picker } from "@react-native-picker/picker";

import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { UserDetailContext } from "@/context/UserDetailContext";

// Hamlet enum values
const HAMLETS = [
  "bavli",
  "dungi",
  "gamtal",
  "master",
  "amli",
  "desai",
  "mandir",
  "pipla",
];

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVillageMember, setIsVillageMember] = useState<null | boolean>(null);
  const [hamlet, setHamlet] = useState("");

  const userDetailContext = useContext(UserDetailContext);
  if (!userDetailContext) {
    throw new Error("SignUp must be used within a UserDetailContext.Provider");
  }
  const { setUserDetail } = userDetailContext;

  const router = useRouter();

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (value: string) => {
      setter(value);
      if (errorMessage) setErrorMessage(null);
    };

  // Save user in Firestore
  const SaveUser = async (
    user: FirebaseUser,
    role: string,
    hamletValue: string
  ) => {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      role,
      approved: false,
      hamlet: hamletValue,
      createdAt: new Date(),
    });
  };

  const handleSignup = async () => {
    setErrorMessage(null);
    setEmailSent(false);

    if (isVillageMember === null) {
      setErrorMessage("Please specify if you are a village member.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (isVillageMember === true && !hamlet.trim()) {
      setErrorMessage("Please select your hamlet.");
      return;
    }

    const role = isVillageMember ? "member" : "others";
    const hamletValue = isVillageMember ? hamlet : "";

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await SaveUser(user, role, hamletValue);

      // Update context
      setUserDetail({
        uid: user.uid,
        email: user.email,
        role,
        approved: true,
        hamlet: hamletValue,
      });

      await sendEmailVerification(user);
      setEmailSent(true);
      Alert.alert(
        "Verification Email Sent",
        "Please check your inbox and verify your email before logging in."
      );

      router.push("/auth/signIn");
      setEmail("");
      setPassword("");
      setIsVillageMember(null);
      setHamlet("");
    } catch (error: any) {
      switch (error.code) {
        case "auth/email-already-in-use":
          setErrorMessage("This email is already registered.");
          break;
        case "auth/invalid-email":
          setErrorMessage("Invalid email address.");
          break;
        case "auth/weak-password":
          setErrorMessage("Password should be at least 6 characters.");
          break;
        default:
          setErrorMessage(`Signup failed. Please try again. ${error.message}`);
          break;
      }
    } finally {
      setLoading(false);
    }
  };
  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  return (
    <SafeAreaView style={{ padding: 20 }}>
      <View>
        <Text style={styles.title}>Sign up</Text>

        {/* Village membership question */}
        <Text style={{ marginBottom: 8 }}>
          Are you a member of the village?
        </Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              isVillageMember === true && styles.optionSelected,
            ]}
            onPress={() => setIsVillageMember(true)}
          >
            <Text style={styles.optionText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              isVillageMember === false && styles.optionSelected,
            ]}
            onPress={() => setIsVillageMember(false)}
          >
            <Text style={styles.optionText}>No</Text>
          </TouchableOpacity>
        </View>

        {/* Hamlet picker if member */}
        {isVillageMember === true && (
          <View style={{ marginVertical: 12 }}>
            <Text>Select your hamlet:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={hamlet}
                onValueChange={(value: string) => setHamlet(value)}
              >
                <Picker.Item label="-- Select Hamlet --" value="" />
                {HAMLETS.map((h) => (
                  <Picker.Item
                    key={h}
                    label={capitalizeFirstLetter(h) + " Faliya"}
                    value={h}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={handleInputChange(setEmail)}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={handleInputChange(setPassword)}
            secureTextEntry
            style={styles.input}
          />
        </View>
        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
        {!emailSent && (
          <TouchableOpacity
            onPress={handleSignup}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign up</Text>
            )}
          </TouchableOpacity>
        )}
        {emailSent && (
          <Text style={styles.emailSent}>
            A verification email has been sent. Please verify before logging in.
          </Text>
        )}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text
              style={styles.loginLink}
              onPress={() => router.push("/auth/signIn")}
            >
              Login
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 16 },
  inputContainer: { marginBottom: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#3182CE",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18 },
  errorMessage: { color: "red", marginBottom: 12, textAlign: "center" },
  emailSent: { color: "green", marginTop: 12, textAlign: "center" },
  loginContainer: { marginTop: 16 },
  loginText: { fontSize: 14 },
  loginLink: { color: "#3182CE", fontWeight: "bold" },
  row: { flexDirection: "row", marginBottom: 10 },
  optionButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    borderRadius: 6,
    marginHorizontal: 5,
  },
  optionSelected: { backgroundColor: "#3182CE" },
  optionText: { color: "#000" },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginTop: 5,
  },
});
