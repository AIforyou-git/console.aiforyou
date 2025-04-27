// app/api/chat-sb/send/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, articleId, userMessage, role = "user" } = body;

    if (!userId || !articleId || !userMessage) {
      return NextResponse.json({ error: "パラメータ不足" }, { status: 400 });
    }

    // 既存のセッションを探す
    const { data: existingSession, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("article_id", articleId)
      .single();

    if (sessionError) {
      console.error("セッション取得エラー:", sessionError.message);
      return NextResponse.json({ error: "セッション取得失敗" }, { status: 500 });
    }

    let sessionId = existingSession?.id;

    // セッションがない場合は作成
    if (!sessionId) {
      const { data: newSession, error: insertError } = await supabase
        .from("chat_sessions")
        .insert({ user_id: userId, article_id: articleId })
        .select("id")
        .single();

      if (insertError) {
        console.error("セッション作成エラー:", insertError.message);
        return NextResponse.json({ error: "セッション作成失敗" }, { status: 500 });
      }

      sessionId = newSession.id;
    }

    // メッセージを保存（roleも一緒に保存！）
    const { error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        text: userMessage,
        role, // 🔥 ここを追加！（デフォルト "user"）
      });

    if (messageError) {
      console.error("メッセージ保存エラー:", messageError.message);
      return NextResponse.json({ error: "メッセージ保存失敗" }, { status: 500 });
    }

    return NextResponse.json({ success: true, sessionId });
  } catch (error: any) {
    console.error("送信エラー:", error.message);
    return NextResponse.json({ error: "送信中にエラー発生" }, { status: 500 });
  }
}
