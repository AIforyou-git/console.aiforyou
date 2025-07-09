// client-dashboard/news-control/index.js

"use client";

import { useState } from "react";
import { useArticles } from "./hooks/useArticles";
import ArticleFilters from "./components/ArticleFilters";
import ArticleCard from "./components/ArticleCard";
import PaginationControls from "./components/PaginationControls";
import { supabase } from "@/lib/supabaseClient";
//import Link from "next/link"; // ✅ ← これが必要

export default function NewsControlPage({ clientData }) {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [area, setArea] = useState("");
  const [sortBy, setSortBy] = useState("published_at");
  
  const [ascending, setAscending] = useState(false);
  const [showSearchOptions, setShowSearchOptions] = useState(false);

  const [showPublishedAt, setShowPublishedAt] = useState(false);
  const isProd = process.env.NODE_ENV === "production";

  const { articles, loading, engaged, userId, totalCount } = clientData
  ? useArticles({
      page,
      keyword,
      sortBy,
      ascending,
      clientData,
      mode: "industry", // ✅ ここを追加
    })
  : {
      articles: [],
      loading: true,
      engaged: {},
      userId: null,
      totalCount: 0,
    };

  const handleEngage = async (articleId, actionType) => {
    const { error } = await supabase
      .from("user_engagement_logs")
      .upsert(
        [
          {
            user_id: userId,
            article_id: articleId,
            action_type: actionType,
            action_value: true,
          },
        ],
        { onConflict: "user_id,article_id,action_type" }
      );

    if (!error) {
      engaged[articleId] = {
        ...(engaged[articleId] || {}),
        [actionType]: true,
      };
    }
  };

  return (
    <div className="pt-4 pb-4 px-2 sm:px-4 space-y-2">
      <h1 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
        📢 {clientData?.name || "○○"}様向けの支援情報
        <span className="text-sm text-gray-500">（{totalCount} 件）</span>
      </h1>

     {/*
<div className="flex gap-2 mt-2 mb-3">
  {[
    { href: "/client-dashboard/news-control/recommended", label: "あなたの新着" },
    { href: "/client-dashboard/news-control", label: "すべての新着" },
    { href: "/client-dashboard/news-control/favorite", label: "お気に入り" },
  ].map((tab) => (
    <Link
      key={tab.href}
      href={tab.href}
      className="px-4 py-1 text-sm font-semibold rounded-full border bg-gray-100 hover:bg-emerald-200 text-gray-700"
    >
      {tab.label}
    </Link>
  ))}
</div>
*/}

      {!isProd && (
        <button
          onClick={() => setShowPublishedAt(!showPublishedAt)}
          className="text-sm text-blue-600 underline mb-2"
        >
          {showPublishedAt ? "📴 公開日を隠す" : "📅 公開日を表示"}
        </button>
      )}

      <ArticleFilters
        keyword={keyword}
        setKeyword={setKeyword}
        area={area}
        setArea={setArea}
        sortBy={sortBy}
        setSortBy={setSortBy}
        setAscending={setAscending}
        showSearchOptions={showSearchOptions}
        setShowSearchOptions={setShowSearchOptions}
      />

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.article_id} className="space-y-1">
              <ArticleCard
                article={article}
                userId={userId}
                engaged={engaged[article.article_id]}
                onEngage={handleEngage}
              />
              {showPublishedAt && article.published_at && (
                <div className="text-[11px] text-right text-gray-400 pr-2">
                  公開日: {new Date(article.published_at).toLocaleDateString("ja-JP")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <PaginationControls page={page} setPage={setPage} />
    </div>
  );
}
