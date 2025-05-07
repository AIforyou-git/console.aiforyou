"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "../types/chat";
import { createClient } from "@supabase/supabase-js";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
}

interface Props {
  articleId?: string;
  uid?: string;
  isFirstSession?: boolean;
  onFetcherReady?: (fetcher: () => void) => void; // ✅ 外部へ通知用
}

export default function ChatHistoryList({ articleId, uid, isFirstSession, onFetcherReady }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ 外部から呼べる fetchMessages を useEffect の外で定義
  const fetchMessages = async () => {
    if (!articleId || !uid) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: session } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("user_id", uid)
      .eq("article_id", articleId)
      .single();

    if (!session) return;

    const { data: chatMessages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });

    if (chatMessages) {
      setMessages(chatMessages as Message[]);
    }
  };

  // ✅ 初回のみ読み込み
  useEffect(() => {
    fetchMessages();
  }, [articleId, uid]);

  // ✅ 親に fetchMessages 関数を通知
  useEffect(() => {
    if (onFetcherReady) {
      onFetcherReady(fetchMessages);
    }
  }, [onFetcherReady]);

  let lastDate = "";

  return (
    <div className="space-y-4">
      <div
        ref={scrollRef}
        className="h-[500px] overflow-y-auto p-4 space-y-2 border rounded bg-white shadow-inner"
      >
        {isFirstSession && (
          <div className="max-w-[80%] px-5 py-3 mb-3 rounded-2xl shadow-sm leading-relaxed tracking-wide text-sm bg-[#dcfce7] text-left text-[#081c15] mr-auto">
            こんにちは！補助金に関するご相談ですね。<br />
            お困りごとや気になる点があれば、どうぞ気軽にご質問ください。
          </div>
        )}

        {messages.map((msg, index) => {
          
          // 修正理由: created_at が存在しないケースへの備えとして null チェックを追加。
// 変更内容: msg.created_at が undefined/null の場合、"日付不明" を表示。
const msgDate = msg.created_at ? formatDate(msg.created_at) : "日付不明";


          const showDate = msgDate !== lastDate;
          lastDate = msgDate;

          const key = msg.id ?? `${msg.role}-${index}`; // 安定したキー提供

          return (
            <div key={key}>
              {showDate && (
                <div className="text-xs text-center text-gray-500 my-4 border-b pb-1">
                  {msgDate}
                </div>
              )}
              <div
                className={`max-w-[80%] px-5 py-3 mb-3 rounded-2xl shadow-sm leading-relaxed tracking-wide text-sm ${
                  msg.role === "user"
                    ? "bg-white border border-gray-200 self-end text-right text-[#1b4332] ml-auto"
                    : "bg-[#dcfce7] text-left text-[#081c15] mr-auto"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
