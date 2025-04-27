"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Message } from "../types/chat";

export function useChatMessages(articleId?: string, uid?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ fetchMessages を useCallback にして外部から呼べるようにする
  const fetchMessages = useCallback(async () => {
    if (!articleId || !uid) return;

    setLoading(true);

    try {
      const { data: session, error: sessionError } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("user_id", uid)
        .eq("article_id", articleId)
        .single();

      if (sessionError || !session) {
        console.error("セッション取得エラー:", sessionError?.message);
        setMessages([]); // 念のため初期化
        setLoading(false);
        return;
      }

      const { data: chatMessages, error: messageError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true });

      if (messageError) {
        console.error("メッセージ取得エラー:", messageError.message);
      } else {
        setMessages(chatMessages as Message[]);
      }
    } catch (error: any) {
      console.error("メッセージ読み込み失敗:", error.message);
    }

    setLoading(false);
  }, [articleId, uid]);

  // ✅ 初回読み込みだけ useEffect で実行
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    refetch: fetchMessages, // ✅ 外部から明示的に再取得可能に
  };
}
