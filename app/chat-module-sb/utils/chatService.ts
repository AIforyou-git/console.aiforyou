// app/chat-module-sb/utils/chatService.ts
import { supabase } from "@/lib/supabaseClient";
import { ChatMessage } from "../types/chat";

export async function fetchChatMessages(sessionId: string) {
  return await supabase
    .from("chat_messages")
    .select("role, content, message_index, created_at")
    .eq("session_id", sessionId)
    .order("message_index", { ascending: true });
}

export async function saveChatMessage(
  message: ChatMessage & { session_id: string; article_id: string; user_id: string; user_email?: string }
) {
  return await supabase.from("chat_messages").insert([message]);
}
