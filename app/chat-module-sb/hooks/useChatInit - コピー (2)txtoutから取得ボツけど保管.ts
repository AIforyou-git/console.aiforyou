// app/chat-module-sb/hooks/useChatInit.ts
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import scrapingSupabase from "@/lib/scrapingSupabaseClient";
import { ChatMessage } from "../types/chat";

interface UseChatInitProps {
  articleId: string | null;
  sessionId: string | null;
}

export function useChatInit({ articleId, sessionId }: UseChatInitProps) {
  const [uid, setUid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState<string | null>(null);
  const [structuredMessage, setStructuredMessage] = useState<ChatMessage | null>(null);
  const [chatReady, setChatReady] = useState(false);
  
  useEffect(() => {
    const initialize = async () => {
      console.log("🟡 useChatInit() → articleId:", articleId); // 👈 追加！
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) return;

      const userId = session.user?.id ?? null;
      const email = session.user?.email ?? null;

      setUid(userId);
      setUserEmail(email);

      if (!articleId) return;

// ✅ タイトルは元テーブルから取得
const { data: articleTitleData, error: titleError } = await scrapingSupabase
  .from("jnet_articles_public")
  .select("title, structured_title")
  .eq("article_id", articleId)
  .single();

if (!titleError && articleTitleData) {
  setArticleTitle(articleTitleData.structured_title || articleTitleData.title);
}

// ✅ 構造化データは scrapingSupabase から取得（txtout_results.gpt_summary）
const { data: gptData, error: gptError } = await scrapingSupabase
  .from("txtout_results")
  .select("gpt_summary")
  .eq("subsidy_id", articleId)
  .single();
  
if (!gptError && gptData?.gpt_summary) {
  setStructuredMessage({
    role: "assistant",
    content: gptData.gpt_summary,
    hidden: true,
  });

  console.log("✅ structuredMessage 初期:", gptData.gpt_summary);
}

// ✅ 構造化の有無にかかわらず ready
setChatReady(true);
}; // ← ✅ initialize 関数ここで閉じる

    initialize();
  }, [articleId, sessionId]);

  return { uid, userEmail, articleTitle, structuredMessage, chatReady };
}
