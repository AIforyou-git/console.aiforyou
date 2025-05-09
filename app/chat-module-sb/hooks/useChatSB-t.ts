"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ✅ 共通型を明示
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useChatSBT(
  articleId?: string | null,
  sessionId?: string | null,
  userEmail?: string | null,
  articleTitle?: string | null,
  onAssistantComplete?: (content: string) => void
) {
  const [input, setInput] = useState("");

  // ✅ 型を ChatMessage[] に統一
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // ✅ structuredMessage も ChatMessage 型に
  const [structuredMessage, setStructuredMessage] = useState<ChatMessage | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // ✅ 型推論でエラーが出る場合は as const を追加
    const newMessages = [...messages, { role: "user" as const, content: input }];
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
      console.error("Stream failed");
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
          console.error("JSON parse error:", err);
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
