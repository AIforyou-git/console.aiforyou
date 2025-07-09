"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect, useState } from "react";

export default function ArticleCard({ article, userId, engaged = {}, onEngage }) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const fetchEmail = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user?.email;
      if (email) {
        setUserEmail(email);
      }
    };
    fetchEmail();
  }, []);

  const handleSupportClick = async () => {
  if (!userId) {
    alert("ログインが必要です。");
    return;
  }

  // ✅ Supabaseセッションから直接 email を取得
  const { data: sessionData } = await supabase.auth.getSession();
  const email = sessionData.session?.user?.email;

  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("article_id", article.article_id)
    .single();

  let sessionId = session?.id;

  if (!sessionId) {
    const { data: inserted, error: insertError } = await supabase
      .from("chat_sessions")
      .insert([
        {
          user_id: userId,
          user_email: email, // ✅ ← 修正：セッションから取得したemailを格納
          article_id: article.article_id,
          article_title_snippet: article.structured_title ?? "（タイトル未定）",
          status: "active",
        },
      ])
      .select("id")
      .single();

      if (insertError || !inserted) {
        alert("セッションの作成に失敗しました。");
        return;
      }

      sessionId = inserted.id;
    }

    router.push(
      `/chat-module-sb?aid=${article.article_id}&uid=${userId}&sid=${sessionId}`
    );
  };

  if (engaged.ignore) return null;

  return (
  <div className="relative p-4 bg-white border border-gray-200 rounded-2xl shadow-md space-y-2">
    {(() => {
  const today = new Date();

// JST補正（+9時間）
const published = new Date(new Date(article.published_at).getTime() + 9 * 60 * 60 * 1000);

const isToday = published.getDate() === today.getDate()
  && published.getMonth() === today.getMonth()
  && published.getFullYear() === today.getFullYear();
  
  const diffDays = Math.floor((today - published) / (1000 * 60 * 60 * 24));
  const isRecent = diffDays >= 1 && diffDays < 7;

  if (isToday) {
    return (
      <div className="absolute top-2 right-2 text-white text-xs px-4 py-1 rounded-full shadow-xl font-bold animate-bounce bg-gradient-to-r from-pink-400 via-fuchsia-500 to-rose-400 ring-2 ring-yellow-300 ring-offset-2 border-2 border-white">
        👑 本日公開！
      </div>
    );
  } else if (isRecent) {
    return (
      <div className="absolute top-2 right-2 text-blue-700 bg-blue-100 text-xs px-3 py-1 rounded-full shadow-sm font-semibold border border-blue-300">
        🆕 New
      </div>
    );
  } else {
    return null;
  }
})()}
      <h2 className="text-lg font-semibold text-emerald-700">
        {article.structured_title || "（タイトル未定）"}
        {engaged.like && (
          <span className="text-yellow-400 text-xl ml-2">★</span>
        )}
      </h2>

      <p className="text-sm text-gray-500">
        {article.structured_agency || "機関不明"} / {article.structured_prefecture || ""} /
        {article.structured_application_period?.start || "未定"}
      </p>

      {article.structured_summary_extract && (
        <p className="text-sm text-gray-700">
          {article.structured_summary_extract}
        </p>
      )}

      {article.structured_amount_max && (
        <p className="text-sm text-gray-600">
          💰 {article.structured_amount_max}
        </p>
      )}

      <a
        href={article.detail_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-sm inline-block"
      >
        記事を見る →
      </a>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={handleSupportClick}
          className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded"
        >
          💬 申請サポート
        </button>

        <button
          onClick={() => {
            onEngage(article.article_id, "like");
            alert("お気に入りを保存しました");
          }}
          className="text-sm px-3 py-1 border border-emerald-400 text-emerald-600 rounded hover:bg-emerald-50"
        >
          👍 お気に入り
        </button>

        <button
          onClick={() => {
            onEngage(article.article_id, "ignore");
            alert("この情報を非表示にしました");
          }}
          className="text-sm px-3 py-1 border border-red-400 text-red-600 rounded hover:bg-red-50"
        >
          🚫 この情報は不要
        </button>
      </div>
    </div>
  );
}
