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
      console.log("🟡 useChatInit() → articleId:", articleId);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) return;

      const userId = session.user?.id ?? null;
      const email = session.user?.email ?? null;

      setUid(userId);
      setUserEmail(email);

      if (!articleId) return;

      const { data: articleTitleData, error: titleError } = await scrapingSupabase
        .from("jnet_articles_public")
        .select("title, structured_title")
        .eq("article_id", articleId)
        .single();

      if (!titleError && articleTitleData) {
        setArticleTitle(articleTitleData.structured_title || articleTitleData.title);
      }

      // ✅ 構造化データ（6カラム取得）
      const { data: structData, error: structError } = await scrapingSupabase
        .from("jnet_articles_public")
        .select(`
          structured_title,
          structured_purpose,
          structured_summary_extract,
          structured_area_full,
          structured_personal_category,
          structured_subcategory
        `)
        .eq("article_id", articleId)
        .single();

      if (!structError && structData) {
        const title = structData.structured_title || "不明";
        const purpose = structData.structured_purpose || "不明";
        const summary = structData.structured_summary_extract || "不明";
        const area = structData.structured_area_full || "不明";
        const category = (structData.structured_personal_category || []).join("・") || "不明";
        const subcategory = (structData.structured_subcategory || []).join("・") || "不明";

        const structuredText = `
【制度名】${title}
【目的】${purpose}
【エリア】${area}
【カテゴリ】${category}
【サブカテゴリ】${subcategory}
【概要】${summary}
        `.trim();

        setStructuredMessage({
          role: "assistant",
          content: structuredText,
          hidden: true,
        });

        console.log("✅ structuredMessage 初期:", structuredText);
      }

      setChatReady(true);
    };

    initialize();
  }, [articleId, sessionId]);

  return { uid, userEmail, articleTitle, structuredMessage, chatReady };
}
