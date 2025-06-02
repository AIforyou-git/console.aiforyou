// app/chat-module-sb/ChatClientSB.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { useChatInit } from "./hooks/useChatInit";

import { useChatSBT } from "./hooks/useChatSBT";
import ChatInput from "./components/ChatInput";
import ChatHistoryModal from "./components/ChatHistoryModal";
import { supabase } from "@/lib/supabaseClient"; // ✅ これが必要です！

interface Props {
  articleId?: string | null;
}

export default function ChatClientSB({ articleId }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const aid = articleId ?? searchParams.get("aid");
  const sid = searchParams.get("sid");

  const { uid, userEmail, articleTitle, structuredMessage, chatReady } = useChatInit({ articleId: aid, sessionId: sid });
  

  const {
    input,
    messages,
    handleInputChange,
    handleSend: originalHandleSend,
    setStructuredMessage,
  } = useChatSBT(aid, sid, userEmail, articleTitle, handleAssistantComplete);

  const [messageIndex, setMessageIndex] = useState(1);

  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [showIntroMessage, setShowIntroMessage] = useState(true);
  const reloadMessagesRef = useRef<() => void>(null);

  useEffect(() => {
    if (!sid) {
      console.warn("セッションIDがありません。リダイレクトします。");
      router.push("/dashboard");
    }
  }, [sid]);

  useEffect(() => {
    if (structuredMessage) {
      setStructuredMessage(structuredMessage);
    }
  }, [structuredMessage]);

  useEffect(() => {
    if (!aid || !uid) return;
    const timer = setTimeout(() => setShowIntroMessage(false), 4000);
    return () => clearTimeout(timer);
  }, [aid, uid]);

  async function handleAssistantComplete(content: string) {
    if (!uid || !sid || !aid || savedIndexes.has(messageIndex)) return;

    const { error } = await supabase.from("chat_messages").insert([
      {
        session_id: sid,
        article_id: aid,
        user_id: uid,
        user_email: userEmail,
        article_title_snippet: articleTitle,
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
  }

  async function handleSend() {
    if (!input || !uid || !aid || !sid) return;

    const { error } = await supabase.from("chat_messages").insert([
      {
        session_id: sid,
        article_id: aid,
        user_id: uid,
        user_email: userEmail,
        article_title_snippet: articleTitle,
        role: "user",
        content: input,
        message_index: messageIndex,
      },
    ]);

    if (error) {
      console.error("メッセージ保存エラー:", error.message);
      return;
    }

    await originalHandleSend();
  }

  return (
    <div className="space-y-4 p-4">
      <button onClick={() => router.back()} className="text-sm text-blue-500 underline hover:text-blue-700">
        ← 前の画面に戻る
      </button>

      {articleTitle && (
        <div className="text-lg font-semibold text-center text-gray-700 my-4">
          「{articleTitle}」についてお答えします
        </div>
      )}

      {showIntroMessage && (
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded text-sm text-center">
          {isFirstSession ? "はじめてのチャットです！" : "ようこそ！ご質問をどうぞ！"}
        </div>
      )}

      <div className="space-y-2 border p-4 rounded bg-white h-[60vh] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`text-sm ${msg.role === "user" ? "text-right text-blue-700" : "text-left text-gray-800"}`}
          >
            <div className="inline-block bg-gray-100 rounded px-3 py-2 max-w-[80%]">
              {msg.created_at && (
                <div className="text-[10px] text-gray-500 mb-1 text-right">
                  {new Date(msg.created_at).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {uid && aid && (
        <button className="text-sm text-blue-600 underline" onClick={() => setShowHistory(true)}>
          過去のやり取りを見る
        </button>
      )}

      {showHistory && aid && uid && (
        <ChatHistoryModal articleId={aid} userId={uid} onClose={() => setShowHistory(false)} />
      )}

      <ChatInput value={input} onChange={handleInputChange} onSend={chatReady ? handleSend : () => {}} />
    </div>
  );
}
