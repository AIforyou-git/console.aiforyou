// client-dashboard/news-control/index.js

"use client";

import { useState } from "react";
import { useArticles } from "./hooks/useArticles";
import ArticleFilters from "./components/ArticleFilters";
import ArticleCard from "./components/ArticleCard";
import PaginationControls from "./components/PaginationControls";
import { supabase } from "@/lib/supabaseClient";

export default function NewsControlPage({ clientData }) {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [area, setArea] = useState("");
  const [sortBy, setSortBy] = useState("published_at");
  
  const [ascending, setAscending] = useState(false);
  const [showSearchOptions, setShowSearchOptions] = useState(false);

  const [showPublishedAt, setShowPublishedAt] = useState(false);
  const isProd = process.env.NODE_ENV === "production";

  const { articles, loading, engaged, userId, totalCount } = useArticles({
    page,
    keyword,
    sortBy,
    ascending,
    clientData: clientData || {},
  });

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
