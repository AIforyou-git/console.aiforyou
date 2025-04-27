"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import { useChatSB } from "./hooks/useChatSB";
import ChatHistoryList from "./components/ChatHistoryList";
import { supabase } from "@/lib/supabaseClient"; // ✅ 共通クライアントに統一
import scrapingClient from "@/lib/supabaseScrapingClient"; // ✅ 既存の構成と同じ
import { Message } from "./types/chat"; // ✅ Message 型インポート

interface Props {
  articleId?: string | null;
}

export default function ChatClientSB({ articleId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const { input, handleInputChange, handleSend, messages } = useChatSB(articleId); // ✅ ここで messages を取得

  const [clientName, setClientName] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState<string | null>(null);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [showIntroMessage, setShowIntroMessage] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      if (!articleId) return;

      const { data: article, error: articleError } = await scrapingClient
        .from("jnet_articles_public")
        .select("title, structured_title")
        .eq("article_id", articleId)
        .single();

      if (articleError) {
        console.error("Article fetch error:", articleError.message);
      }

      if (article?.structured_title) {
        setArticleTitle(article.structured_title);
      } else if (article?.title) {
        setArticleTitle(article.title);
      }

      const { data: sessions, error: sessionError } = await supabase
        .from("chat_sessions")
        .select("user_id")
        .eq("article_id", articleId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (sessionError) {
        console.error("Session fetch error:", sessionError.message);
        return;
      }

      if (sessions && sessions.length > 0) {
        const userId = sessions[0].user_id;

        const { data: client } = await supabase
          .from("clients")
          .select("company")
          .eq("uid", userId)
          .single();

        if (client?.company) {
          setClientName(client.company);
        }
      }
    };

    fetchInfo();
  }, [articleId]);

  useEffect(() => {
    const checkSession = async () => {
      if (!articleId || !uid) return;

      const { data: session } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("article_id", articleId)
        .eq("user_id", uid)
        .single();

      if (!session) {
        setIsFirstSession(true);
      }
    };

    checkSession();
    const timer = setTimeout(() => setShowIntroMessage(false), 4000);
    return () => clearTimeout(timer);
  }, [articleId, uid]);

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="text-sm text-blue-500 underline hover:text-blue-700"
      >
        ← 前の画面に戻る
      </button>

      {articleTitle && (
        <div className="text-lg font-semibold text-center text-gray-700 my-4">
          「{articleTitle}」についてお答えします
        </div>
      )}

      {showIntroMessage && (
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded text-sm text-center">
          {isFirstSession
            ? "はじめてのチャットです！"
            : "前回のチャットの続きになります"}
        </div>
      )}

      {/* ✅ messages を渡す */}
      <ChatHistoryList
        messages={messages}
        isFirstSession={isFirstSession}
      />
      
      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSend={handleSend}
      />
    </div>
  );
}
