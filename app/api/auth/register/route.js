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
    console.log("🚀 [REGISTER] API 呼び出し開始");
    
    const { email, referredBy } = await req.json();
    console.log("📩 受信データ:", { email, referredBy });

    if (!email) {
      console.error("❌ メールアドレスが提供されていません");
      return new Response(JSON.stringify({ error: "メールアドレスが必要です" }), { status: 400 });
    }

    // 🔥 紹介コードを解析
    const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
    console.log("🔗 紹介コード解析リクエスト送信:", `${baseUrl}/api/auth/referral?ref=${referredBy}`);

    const response = await fetch(`${baseUrl}/api/auth/referral?ref=${referredBy}`);

    if (!response.ok) {
      console.error("❌ 紹介コードの解析に失敗");
      throw new Error("紹介コードの解析に失敗しました");
    }

    const { role, referrerId } = await response.json();
    console.log("🔍 紹介コード解析結果:", { role, referrerId });

    // 🔥 仮パスワードを生成
    const tempPassword = Math.random().toString(36).slice(-8);
    console.log("🛠️ 仮パスワード生成:", tempPassword);

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
      role: role,
      referredBy: referrerId,
      createdAt: new Date(),
      status: "pending", 
      lastLogin: null,
    });
    console.log("✅ Firestore 保存完了:", user.uid);

    // 🔥 メール送信 API を呼び出す
    console.log("📨 メール送信 API 呼び出し開始");
    const emailResponse = await fetch(`${baseUrl}/api/auth/send-email`, {
      method: "POST",
      body: JSON.stringify({ email, tempPassword }),
      headers: { "Content-Type": "application/json" },
    });

    if (!emailResponse.ok) {
      console.error("❌ メール送信に失敗");
      throw new Error("メール送信に失敗しました");
    }
    console.log("✅ メール送信成功:", email);

    return new Response(JSON.stringify({ success: true, role }), { status: 200 });

  } catch (error) {
    console.error("❌ [REGISTER] エラー発生:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
