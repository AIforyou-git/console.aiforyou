import { useState, useEffect } from "react";
import { ChatMessage } from "../types/chat";
import { fetchChatMessages } from "../utils/chatService";
import { supabase } from "@/lib/supabaseClient"; // ← ✅ 必須

export function useChatSBT(
  articleId?: string | null,
  sessionId?: string | null,
  userEmail?: string | null,
  articleTitle?: string | null,
  onAssistantComplete?: (content: string) => void
) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [structuredMessage, setStructuredMessage] = useState<ChatMessage | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!sessionId) return;
      const { data, error } = await fetchChatMessages(sessionId);
      if (data) setMessages(data);
      else if (error) console.error("履歴取得失敗:", error.message);
    };
    load();
  }, [sessionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage: ChatMessage = { role: "user", content: input };
const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInput("");

    const response = await fetch("/api/chat-gpt-stream-t", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          ...(structuredMessage ? [structuredMessage] : []),
          ...newMessages,
        ],
      }),
    });

    if (!response.ok || !response.body) {
      console.error("GPT ストリームエラー");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.replace("data: ", "").trim();
        if (jsonStr === "[DONE]") {
          if (assistantContent && onAssistantComplete) {
            onAssistantComplete(assistantContent);
          }
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const temp = [...prev];
              const last = temp[temp.length - 1];
              if (last?.role === "assistant") {
                temp[temp.length - 1] = {
                  ...last,
                  content: last.content + content,
                };
              } else {
                temp.push({ role: "assistant", content });
              }
              return temp;
            });
          }
        } catch (err) {
          console.error("ストリーム JSON 解析エラー:", err);
        }
      }

      buffer = lines[lines.length - 1];
    }
  };

  return {
    input,
    messages,
    handleInputChange,
    handleSend,
    setStructuredMessage,
  };
}
