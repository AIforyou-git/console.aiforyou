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

export async function POST(req) {
  try {
    const { email, referredBy } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "メールアドレスが必要です" }), { status: 400 });

    // 🔥 紹介コードを解析（別API呼び出し）
    const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/auth/referral?ref=${referredBy}`);

    if (!response.ok) throw new Error("紹介コードの解析に失敗しました");
    const { role, referrerId } = await response.json();

    // 🔥 仮パスワードを生成
    const tempPassword = Math.random().toString(36).slice(-8);

    // 🔥 Firebase Authentication に登録
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    const user = userCredential.user;

    // 🔥 Firestore にユーザー情報を保存（status: "pending"）
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      role: role,
      referredBy: referrerId,
      createdAt: new Date(),
      status: "pending", // ✅ 初回登録時は `pending`
      lastLogin: null,    // ✅ 最初のログイン時に更新
    });

    // 🔥 メール送信 API を呼び出す
    await fetch(`${baseUrl}/api/auth/send-email`, {
      method: "POST",
      body: JSON.stringify({ email, tempPassword }),
      headers: { "Content-Type": "application/json" },
    });

    return new Response(JSON.stringify({ success: true, role }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
