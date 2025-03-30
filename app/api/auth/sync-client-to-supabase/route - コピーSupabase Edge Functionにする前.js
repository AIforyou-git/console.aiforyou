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

// Supabase 初期化
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    console.log("🚀 [SYNC-CLIENT] Supabase 同期処理開始");

    const { uid } = await req.json();
    if (!uid) {
      console.error("❌ UID が空です");
      return new Response(JSON.stringify({ error: "UID is required" }), { status: 400 });
    }

    // Firestore から clients/{uid} を取得
    const clientRef = doc(db, "clients", uid);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) {
      console.error("❌ クライアントデータが Firestore に存在しません");
      return new Response(JSON.stringify({ error: "Client not found in Firestore" }), { status: 404 });
    }

    const clientData = clientSnap.data();
    console.log("📦 Firestore データ:", clientData);

    // Supabase に送信するデータ構築
    const supabaseData = {
      uid: uid,
      email: clientData.email ?? null,
      name: clientData.name ?? null,
      company: clientData.company ?? null,
      position: clientData.position ?? null,
      region_prefec: clientData.regionPrefecture ?? null,
      region_city: clientData.regionCity ?? null,
      industry: clientData.industry ?? null,
      memo: clientData.memo ?? null,
      profile_complete: clientData.profileCompleted ?? false,
      created_at: clientData.createdAt?.toDate().toISOString() ?? null,
      updated_at: new Date().toISOString(),
    };

    console.log("📤 Supabase に upsert:", supabaseData);

    const { error } = await supabase
      .from("clients")
      .upsert(supabaseData, { onConflict: ["uid"] });

    if (error) {
      console.error("❌ Supabase 同期エラー:", error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log("✅ Supabase 同期成功:", uid);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error("❌ 同期処理中の例外:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
