import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestore をインポート

// ✅ 環境変数の確認（デバッグ用）
console.log("🚀 Firebase API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "MISSING");
console.log("🚀 Firebase Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "MISSING");
console.log("🚀 Firebase Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "MISSING");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Firebase の初期化を重複させない
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp); // 認証機能
const db = getFirestore(firebaseApp); // Firestore 初期化

export { firebaseApp, firebaseAuth, db };
