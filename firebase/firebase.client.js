import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import firebaseConfig from "./firebaseConfig";

// 앱 인스턴스: 이미 있으면 getApp(), 없으면 initializeApp()
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth 인스턴스: 이미 있으면 getAuth(app), 없으면 initializeAuth(app, ...)
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// DB 인스턴스
const db = getDatabase(app);
// Storage 인스턴스
const storage = getStorage(app);

export { app, auth, db, storage };

