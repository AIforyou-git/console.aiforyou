import { db } from "@/lib/firestore";
import { auth } from "@/lib/firebaseAdmin"; // Firebase Admin SDK を利用
import { doc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ error: "メールアドレスとロールが必要です" }, { status: 400 });
    }

    // ✅ 仮パスワードを生成（8桁のランダム文字列）
    const tempPassword = Math.random().toString(36).slice(-8);

    // ✅ Firebase Authentication にユーザー作成
    const userRecord = await auth.createUser({
      email,
      password: tempPassword,
      emailVerified: false,
      disabled: false,
    });

    console.log("✅ Firebase Auth にユーザー作成:", userRecord.uid);

    // ✅ Firestore にも `users` を作成
    await setDoc(doc(db, "users", userRecord.uid), {
      uid: userRecord.uid,
      email: email,
      role: role,
      referredBy: "admin",
      createdAt: new Date(),
      status: "pending",
      lastLogin: null,
    });

    console.log("✅ Firestore にユーザー情報を登録");

    return NextResponse.json({ success: true, uid: userRecord.uid }, { status: 200 });

  } catch (error) {
    console.error("❌ ユーザー作成エラー:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
