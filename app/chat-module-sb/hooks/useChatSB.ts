import { useState } from "react";
import { postChatMessage } from "@/lib/supabaseChat";
import { Message } from "../types/chat";

export const useChatSB = (articleId?: string | null) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // ✅ クエリから uid を取得
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get("uid");

    if (!uid || !articleId) {
      alert("ユーザーまたは記事情報が不足しています。");
      return;
    }

    // ✅ 戻り値を分解して使用
    const { assistantText } = await postChatMessage(uid, articleId, input);

    setMessages([
      ...messages,
      {
        id: "user-" + Date.now(),
        role: "user",
        text: input,
        created_at: new Date().toISOString(),
      },
      {
        id: "assistant-" + Date.now(),
        role: "assistant",
        text: assistantText,
        created_at: new Date().toISOString(),
      },
    ]);

    setInput("");
  };

  return {
    input,
    handleInputChange,
    handleSend,
    messages,
  };
};
