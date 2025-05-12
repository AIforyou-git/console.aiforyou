// client-dashboard/news-control/components/ArticleCard.jsx

"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import React from "react";

export default function ArticleCard({ article, userId, engaged = {}, onEngage }) {
  const router = useRouter();

  const handleSupportClick = async () => {
    if (!userId) {
      alert("ログインが必要です。");
      return;
    }

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
            article_id: article.article_id,
            user_email: null,
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
    <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-md space-y-2">
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
          onClick={() => onEngage(article.article_id, "like")}
          className="text-sm px-3 py-1 border border-emerald-400 text-emerald-600 rounded hover:bg-emerald-50"
        >
          👍 お気に入り
        </button>

        <button
          onClick={() => onEngage(article.article_id, "ignore")}
          className="text-sm px-3 py-1 border border-red-400 text-red-600 rounded hover:bg-red-50"
        >
          🚫 この情報は不要
        </button>
      </div>
    </div>
  );
}