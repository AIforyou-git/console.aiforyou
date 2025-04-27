"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Message } from "../types/chat";

export function useChatSB(articleId?: string | null) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("ユーザー取得エラー:", authError?.message);
        return;
      }

      const { data: session } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("article_id", articleId)
        .single();

      if (!session) return;

      const { data: chatMessages, error: msgError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true });

      if (msgError) {
        console.error("メッセージ取得エラー:", msgError.message);
        return;
      }

      setMessages(chatMessages as Message[]);
    };

    if (articleId) {
      loadMessages();
    }
  }, [articleId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      alert("ログインが必要です。");
      return;
    }

    try {
      // ユーザーメッセージを送信
      const sendRes = await fetch("/api/chat-sb/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          articleId,
          userMessage: input.trim(),
        }),
      });

      const sendResult = await sendRes.json();

      if (!sendRes.ok) {
        console.error("チャット送信エラー:", sendResult.error);
        return;
      }

      // 楽観的更新：ユーザーメッセージを即時表示
      const userMessage: Message = {
        session_id: sendResult.sessionId,
        role: "user",
        text: input.trim(),
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      // ✨ ここで GPT応答を取得
      const gptRes = await fetch("/api/chat-gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input.trim(),
        }),
      });

      const gptResult = await gptRes.json();

      if (!gptRes.ok) {
        console.error("GPT応答エラー:", gptResult.error);
        return;
      }

      // GPTメッセージを保存
      const saveGptRes = await fetch("/api/chat-sb/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          articleId,
          userMessage: gptResult.answer,
          role: "assistant", // 🔥 assistant役割で保存
        }),
      });

      const saveGptResult = await saveGptRes.json();

      if (!saveGptRes.ok) {
        console.error("GPTメッセージ保存エラー:", saveGptResult.error);
        return;
      }

      // 楽観的更新：GPTメッセージを即時表示
      const assistantMessage: Message = {
        session_id: saveGptResult.sessionId,
        role: "assistant",
        text: gptResult.answer,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("送信リクエスト失敗:", error.message);
    }
  };

  return {
    input,
    messages,
    handleInputChange,
    handleSend,
  };
}
