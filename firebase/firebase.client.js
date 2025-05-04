
//  import { initializeApp, getApps, getApp } from '@firebase/app';
//  import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
//  import AsyncStorage from '@react-native-async-storage/async-storage'; //sdk 53버전 업데이트 이후 사용해야 동작 가능하다고 해서 이렇게 해봤습니다다
//  import firebaseConfig from './firebaseConfig';

//  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

//  const auth = initializeAuth(app, {
//    persistence: getReactNativePersistence(AsyncStorage),
//  });

//  export { app, auth };

import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import firebaseConfig from "./firebaseConfig";

// 앱 초기화
const app = initializeApp(firebaseConfig);

// Auth 초기화 (최상단에서 단 한 번만!)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// DB 인스턴스
const db = getDatabase(app);

export { app, auth, db };

