import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin"; // Firebase Admin SDK をインポート

export async function POST(req) {
  try {
    const token = req.cookies.get("session")?.value; // クッキーからトークン取得
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Firebase でトークン検証
    const decodedToken = await admin.auth().verifyIdToken(token);
    return NextResponse.json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    console.error("認証エラー:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
