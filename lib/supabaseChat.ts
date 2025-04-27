import { createClient } from "@supabase/supabase-js";
export async function postChatMessage(
  uid: string,
  articleId: string,
  text: string
): Promise<{ assistantText: string; isFirstSession: boolean }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", uid)
    .eq("article_id", articleId)
    .single();

  let sessionId = session?.id ?? crypto.randomUUID();
  const isFirstSession = !session;

  if (isFirstSession) {
    await supabase.from("chat_sessions").insert({
      id: sessionId,
      user_id: uid,
      article_id: articleId,
    });
  }

  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role: "user",
    text,
  });

  // GPT呼び出し
  let assistantText = "回答の取得に失敗しました。";
  try {
    const res = await fetch("/api/chat-gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    assistantText = data.answer ?? assistantText;
  } catch (err) {
    console.error("GPT fetch error:", err);
  }

  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role: "assistant",
    text: assistantText,
  });

  return { assistantText, isFirstSession };
}
