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

 // ✅ 構造化データを取得して system prompt に反映
const { data: article } = await supabase
.from("jnet_articles_public")
.select("title, summary, purpose, supportScale, target_industry, applicationPeriod, detail_url")
.eq("article_id", articleId)
.eq("structured_success", true)
.single();

// fallback（見つからない場合）
const fallbackSystemPrompt = `該当する制度が見つかりませんでした。制度名をご確認ください。`;

const systemMessage = article
? `以下は対象の補助金制度データです。この情報を使って、ユーザーの質問に正確に答えてください。

■ 制度名：${article.title}
■ 概要：${article.summary || article.purpose}
📌 支援金額：${article.supportScale}
🏢 対象業種：${article.target_industry}
📅 募集期間：${article.applicationPeriod}
🔗 詳細：${article.detail_url}`
: fallbackSystemPrompt;

const messages = [
{ role: "system", content: systemMessage },
{ role: "user", content: text },
];


  // ✅ GPT呼び出し
  let assistantText = "回答の取得に失敗しました。";
  try {
    const res = await fetch("/api/chat-gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
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
