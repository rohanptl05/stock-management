import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence , browserLocalPersistence} from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { Platform } from 'react-native';

const firebaseConfig = {
 apiKey: "AIzaSyD2l9G5tf1giT5r7J8esVZOt26nIWlTM34",
  authDomain: "digital-village-9e9f6.firebaseapp.com",
  projectId: "digital-village-9e9f6",
  storageBucket: "digital-village-9e9f6.firebasestorage.app",
  messagingSenderId: "399723010789",
  appId: "1:399723010789:web:ba60a0747a96bf2fe0920c",
  measurementId: "G-5X7CF4JKMS"
};

const app = initializeApp(firebaseConfig);

// Correct Auth initialization for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
