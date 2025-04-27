"use client";

import { useRef } from "react";
import { Message } from "../types/chat";

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
  messages: Message[];
  isFirstSession?: boolean;
}

export default function ChatHistoryList({ messages, isFirstSession }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
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
          const msgDate = formatDate(msg.created_at);
          const showDate = msgDate !== lastDate;
          lastDate = msgDate;

          const key = msg.id ?? `${msg.role}-${index}`;

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
