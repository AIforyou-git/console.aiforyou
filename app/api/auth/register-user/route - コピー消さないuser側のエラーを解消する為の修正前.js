import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Firebase 設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔥 仮パスワードをランダム生成する関数
function generateTempPassword(length = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(req) {
  try {
    console.log("🚀 [REGISTER-USER] API 呼び出し開始");

    const { email, referredBy } = await req.json();
    console.log("📩 受信データ:", { email, referredBy });

    if (!email) {
      console.error("❌ メールアドレスが提供されていません");
      return new Response(JSON.stringify({ error: "メールアドレスが必要です" }), { status: 400 });
    }

    // ✅ referredBy の接頭辞に応じた ID 抽出
    let referrerId = null;
    if (referredBy?.startsWith("HQ-USER-")) {
      referrerId = referredBy.split("HQ-USER-")[1];
    } else if (referredBy?.startsWith("CQ-CLIENT-")) {
      referrerId = referredBy.split("CQ-CLIENT-")[1];
    } else if (referredBy === "HQ-CLIENT") {
      referrerId = "HQ-CLIENT";
    }

    // 🔥 仮パスワードを生成
    const tempPassword = generateTempPassword(12);
    console.log("🛠️ 生成された仮パスワード:", tempPassword);

    // 🔥 Firebase Authentication に登録
    console.log("🔑 Firebase Authentication 登録開始:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    const user = userCredential.user;
    console.log("✅ Firebase 登録成功:", user.uid);

    // 🔥 Firestore にユーザー情報を保存
    console.log("📝 Firestore へのユーザー情報保存開始");
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      role: "client",
      referredBy: referrerId,
      createdAt: new Date(),
      status: "pending",
      lastLogin: null,
    });
    console.log("✅ Firestore 保存完了:", user.uid);

    const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";

    // 🔥 メール送信 API を呼び出す
    console.log("📨 メール送信 API 呼び出し開始:", `${baseUrl}/api/auth/send-email`);
    const emailResponse = await fetch(`${baseUrl}/api/auth/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, tempPassword }),
    });

    const emailData = await emailResponse.json();
    console.log("📩 メール送信 API レスポンス:", emailData);

    if (!emailResponse.ok) {
      console.error("❌ メール送信失敗:", emailData.error);
      throw new Error(emailData.error);
    }

    console.log("✅ メール送信成功:", email);

    // ✅ Supabase 同期 API を非同期で呼び出す（失敗してもメール処理には影響なし）
    console.log("🔁 Supabase 同期 API 呼び出し開始");
    fetch(`${baseUrl}/api/auth/sync-to-supabase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid }),
    }).then(res => res.json())
      .then(data => {
        console.log("✅ Supabase 同期完了:", data);
      })
      .catch(err => {
        console.error("❌ Supabase 同期エラー:", err.message);
      });

    // ✅ レスポンス
    return new Response(JSON.stringify({ success: true, tempPassword }), { status: 200 });

  } catch (error) {
    console.error("❌ [REGISTER-USER] エラー発生:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
