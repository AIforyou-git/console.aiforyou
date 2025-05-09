"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatInput from "./components/ChatInput";
import { useChatSBT } from "./hooks/useChatSB-t";

import { supabase } from "@/lib/supabaseClient";
import scrapingSupabase from "@/lib/scrapingSupabaseClient";
import ChatHistoryModal from "./components/ChatHistoryModal";

interface Props {
  articleId?: string | null;
}

export default function ChatClientSB({ articleId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const aid = articleId ?? searchParams.get("aid");
  const uid = searchParams.get("uid");
  const sid = searchParams.get("sid");
  const userEmail = searchParams.get("email");

  const [messageIndex, setMessageIndex] = useState(1);
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());

  const handleAssistantComplete = async (content: string) => {
    if (!uid || !sid || !aid || savedIndexes.has(messageIndex)) return;

    const { error } = await supabase.from("chat_messages").insert([
      {
        session_id: sid,
        article_id: aid,
        user_id: uid,
        user_email: userEmail,
        role: "assistant",
        content,
        message_index: messageIndex,
      },
    ]);

    if (error) {
      console.error("AI応答保存エラー:", error.message);
      return;
    }

    setSavedIndexes((prev) => new Set(prev).add(messageIndex));
    setMessageIndex((prev) => prev + 1);
  };

  const {
    input,
    messages,
    handleInputChange,
    handleSend: originalHandleSend,
    setStructuredMessage,
  } = useChatSBT(aid, sid, userEmail, undefined, handleAssistantComplete);

  const [clientName, setClientName] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false); // 🔸追加
  const [articleTitle, setArticleTitle] = useState<string | null>(null);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [showIntroMessage, setShowIntroMessage] = useState(true);
  const reloadMessagesRef = useRef<() => void>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      if (!aid) return;

      const { data: article, error: articleError } = await scrapingSupabase
        .from("jnet_articles_public")
        .select("title, structured_title, structured_summary")
        .eq("article_id", aid)
        .single();

      if (articleError) {
        console.error("Article fetch error:", articleError.message);
        return;
      }

      if (!article) {
        console.warn("記事が見つかりませんでした。", aid);
        return;
      }

      if (article.structured_title) {
        setArticleTitle(article.structured_title);
      } else if (article.title) {
        setArticleTitle(article.title);
      }

      if (article.structured_summary) {
        setStructuredMessage({
          role: "assistant",
          content: article.structured_summary,
          hidden: true,
        });
      }

      const { data: sessions, error: sessionError } = await supabase
        .from("chat_sessions")
        .select("user_id")
        .eq("article_id", aid)
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
  }, [aid]);

  useEffect(() => {
    const checkSession = async () => {
      if (!aid || !uid) return;

      const { data: session } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("article_id", aid)
        .eq("user_id", uid)
        .single();

      if (!session) {
        setIsFirstSession(true);
      }
    };

    checkSession();
    const timer = setTimeout(() => setShowIntroMessage(false), 4000);
    return () => clearTimeout(timer);
  }, [aid, uid]);

  // 🔸 ユーザーメッセージの保存とAI送信
  const handleSend = async () => {
    if (!input || !uid || !aid || !sid) {
      console.warn("必須情報が不足しています。");
      return;
    }

    const { error } = await supabase.from("chat_messages").insert([
      {
        session_id: sid,
        article_id: aid,
        user_id: uid,
        user_email: userEmail,
        role: "user",
        content: input,
        message_index: messageIndex,
      },
    ]);

    if (error) {
      console.error("メッセージ保存エラー:", error.message);
      return;
    }

    await originalHandleSend(); // AI応答を開始
  };

  return (
    <div className="space-y-4 p-4">
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
            : "ようこそ！ご質問をどうぞ！"}
        </div>
      )}

      <div className="space-y-2 border p-4 rounded bg-white h-[60vh] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`text-sm ${
              msg.role === "user"
                ? "text-right text-blue-700"
                : "text-left text-gray-800"
            }`}
          >
            <div className="inline-block bg-gray-100 rounded px-3 py-2 max-w-[80%]">
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      {uid && aid && (
  <button
    className="text-sm text-blue-600 underline"
    onClick={() => setShowHistory(true)}
  >
    過去のやり取りを見る
  </button>
)}

{showHistory && aid && uid && (
  <ChatHistoryModal
    articleId={aid}
    userId={uid}
    onClose={() => setShowHistory(false)}
  />
)}
      

      

      <ChatInput value={input} onChange={handleInputChange} onSend={handleSend} />
    </div>
  );
}
