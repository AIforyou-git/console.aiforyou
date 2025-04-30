import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    // リクエストからAuthorizationヘッダー取得
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "認証トークンがありません。" }, { status: 401 });
    }

    // トークンを使ってSupabase Authユーザー情報取得
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error("ユーザー取得失敗", error);
      return NextResponse.json({ message: "ユーザー情報取得失敗" }, { status: 401 });
    }

    // ユーザー情報から必要な情報だけ返す
    return NextResponse.json({
      uid: user.id,
      email: user.email,
      role: user.user_metadata?.role || "未設定",
    });
  } catch (err) {
    console.error("サーバーエラー", err);
    return NextResponse.json({ message: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}