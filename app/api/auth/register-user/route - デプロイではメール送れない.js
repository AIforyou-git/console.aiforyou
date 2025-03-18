import { createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";  
import { db } from "@/lib/firestore";
import { doc, setDoc } from "firebase/firestore";

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
    const { email, referredBy } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "メールアドレスが必要です" }), { status: 400 });

    // ✅ `referredBy` は `signup-user` でチェック済みなので、そのまま保存
    const referrerId = referredBy?.startsWith("HQ-USER-") ? referredBy.split("HQ-USER-")[1] : null;

    // 🔥 仮パスワードをランダム生成
    const tempPassword = generateTempPassword(12);
    console.log(`🛠 生成された仮パスワード: ${tempPassword}`);

    // 🔥 Firebase Authentication に登録
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, tempPassword);
    const user = userCredential.user;

    // 🔥 Firestore にユーザー情報を `client` として保存
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      role: "client",  // ⬅️ ここを "client" に変更！
      referredBy: referrerId,  
      createdAt: new Date(),
      status: "pending",
      lastLogin: null,
    });

    // 🔥 `send-email-user` を呼び出してメール送信
    console.log("📧[CLIENT] メール送信処理を開始");
    const emailResponse = await fetch("http://localhost:3000/api/auth/send-email-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, tempPassword }),
    });
    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("❌[CLIENT] メール送信エラー:", emailData.error);
    } else {
      console.log("✅[CLIENT] メール送信成功:", emailData);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("エラー:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
