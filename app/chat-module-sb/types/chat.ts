// app/chat-module-sb/types/chat.ts
// 修正理由: ChatHistoryList.tsx にて msg.created_at が必要なため。
// 変更内容: created_at をオプショナルで追加し、安全な型アクセスを実現。
export type Message = {
  id: string;
  text: string;
  role: string;
  created_at?: string;
};