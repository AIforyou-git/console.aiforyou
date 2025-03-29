import nodemailer from "nodemailer";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Supabase 初期化
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    console.log("🚀 [SEND-EMAIL] API 呼び出し開始");

    const { email, tempPassword } = await req.json();
    console.log("📩 受信データ:", { email, tempPassword });

    if (!email || !tempPassword) {
      console.error("❌ 必要な情報が不足しています");
      return new Response(JSON.stringify({ error: "必要な情報がありません" }), {
        status: 400,
      });
    }

    console.log("📡 SMTP 環境変数:");
    console.log("  - SMTP_HOST:", process.env.SMTP_HOST || "❌ 未設定");
    console.log("  - SMTP_PORT:", process.env.SMTP_PORT || "❌ 未設定");
    console.log("  - SMTP_USER:", process.env.SMTP_USER || "❌ 未設定");
    console.log("  - SMTP_PASS:", process.env.SMTP_PASS ? "✅ 設定済み" : "❌ 未設定");

    const smtpPort = parseInt(process.env.SMTP_PORT, 10);
    const secureMode = smtpPort === 465;

    console.log("🔧 SMTP 設定:", { secureMode, smtpPort });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: secureMode,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const loginUrl = "https://console.aiforyou.jp/";
    const mailContent = `
      ${email} 様

      Aiforyou へのご登録ありがとうございます。

      以下の情報でログインし、アカウントの設定を行ってください。

      -------------------------------------
      メールアドレス: ${email}
      仮パスワード: ${tempPassword}
      ログインURL: ${loginUrl}
      -------------------------------------

      ※ログイン後、パスワードを変更することをおすすめします。

      今後とも Aiforyou をよろしくお願いいたします。

      Aiforyou サポートチーム
      開発用：http://localhost:3000/
    `;

    console.log("✉️ メール本文:", mailContent);

    const info = await transporter.sendMail({
      from: `"Aiforyou" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "【Aiforyou】アカウント登録完了 - 初回ログインのご案内",
      text: mailContent,
    });

    console.log(`✅ メール送信成功: メールID ${info.messageId} / 宛先: ${email}`);

    // 🔁 Supabase 同期処理（メール送信成功後）
    try {
      console.log("📡 Firestore → Supabase 同期開始");

      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);
      if (snapshot.empty) throw new Error("Firestore に該当ユーザーが存在しません");

      const docData = snapshot.docs[0].data();
      const { uid, referredBy, createdAt, role, status, lastLogin } = docData;

      const syncData = {
        uid,
        email,
        referred_by: referredBy,
        created_at: createdAt.toDate ? createdAt.toDate().toISOString() : createdAt,
        role,
        status,
        last_login: lastLogin,
      };

      console.log("📤 Supabase に送信:", syncData);

      const { error } = await supabase.from("client_accounts").upsert(syncData);

      if (error) {
        console.error("❌ Supabase 同期エラー:", error.message || JSON.stringify(error));
      } else {
        console.log("✅ Supabase 同期成功:", uid);
      }
    } catch (sbError) {
      console.error("❌ Supabase 同期例外:", sbError.message || JSON.stringify(sbError));
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("❌ メール送信エラー:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
