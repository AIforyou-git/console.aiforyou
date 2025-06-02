"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  articleId: string;
  userId: string;
  onClose: () => void;
}

export default function ChatHistoryModal({ articleId, userId, onClose }: Props) {
  const [messages, setMessages] = useState<
    { content: string; role: string; session_id: string; created_at: string }[]
  >([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("content, role, session_id, created_at")
        .eq("article_id", articleId)
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("履歴取得エラー:", error.message);
        return;
      }

      setMessages(data || []);
    };

    fetchHistory();
  }, [articleId, userId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl p-4 rounded shadow-lg h-[70vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">過去のやり取り</h2>
          <button className="text-sm text-blue-600" onClick={onClose}>閉じる</button>
        </div>
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">履歴はありません。</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`text-sm my-1 ${
                msg.role === "user" ? "text-right text-blue-700" : "text-left text-gray-800"
              }`}
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
          ))
        )}
      </div>
    </div>
  );
}
