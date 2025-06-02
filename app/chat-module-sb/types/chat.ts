// app/chat-module-sb/types/chat.ts

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  hidden?: boolean;
  created_at?: string;
  message_index?: number;
};

export type ArticleInfo = {
  title: string;
  structured_title?: string;
  structured_summary?: string;
};
