import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { createClient } from "@supabase/supabase-js";

// Firebase 初期化
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

// Supabase クライアント初期化
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { uid } = await req.json();
    if (!uid) {
      return new Response(JSON.stringify({ error: "uid is required" }), { status: 400 });
    }

    console.log("📡 Firestore → Supabase 同期開始");

    // Firestore からユーザーデータ取得
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return new Response(JSON.stringify({ error: "User not found in Firestore" }), { status: 404 });
    }

    const userData = userSnap.data();

    // Supabase に送信するデータ
    const supabaseData = {
      uid: userData.uid,
      email: userData.email,
      referred_by: userData.referredBy ?? null,
      created_at: userData.createdAt?.toDate().toISOString() ?? null,
      role: userData.role ?? null,
      status: userData.status ?? null,
      last_login: userData.lastLogin ? userData.lastLogin.toDate().toISOString() : null,
    };

    console.log("📤 Supabase に送信: ", supabaseData);

    const { error } = await supabase
      .from("client_accounts")
      .upsert(supabaseData, { onConflict: ["uid"] });

    if (error) {
      console.error("❌ Supabase 同期エラー:", error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log("✅ Supabase 同期成功:", uid);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("❌ Supabase 同期中の例外:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
