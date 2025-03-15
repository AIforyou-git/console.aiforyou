import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import nodemailer from "nodemailer";

// Firebase の設定
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
    const { email } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "メールアドレスが必要です" }), { status: 400 });

    // 🔥 仮パスワードを生成
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // 🔥 Firebase Authentication に登録
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    const user = userCredential.user;

    // 🔥 Firestore に登録
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      role: "user", // 仮登録では `user` として登録
      createdAt: new Date(),
    });

    // 🔥 メール送信設定
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Aiforyou" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "【Aiforyou】仮登録完了 - 仮パスワード発行",
      text: `仮登録が完了しました。\n\n仮パスワード: ${tempPassword}\n\nこのパスワードでログインし、設定を変更してください。\n\nAiforyou サポートチーム`,
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
