// client-dashboard/news-control/index.js

"use client";

import { useState } from "react";
import { useArticles } from "./hooks/useArticles";
import ArticleFilters from "./components/ArticleFilters";
import ArticleCard from "./components/ArticleCard";
import PaginationControls from "./components/PaginationControls";

export default function NewsControlPage() {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [area, setArea] = useState("");
  const [sortBy, setSortBy] = useState("structured_at");
  const [ascending, setAscending] = useState(false);
  const [showSearchOptions, setShowSearchOptions] = useState(false);

  const { articles, loading, engaged, userId } = useArticles({ page, keyword, sortBy, ascending });

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
      // 再フェッチよりもローカル更新が高速
      engaged[articleId] = {
        ...(engaged[articleId] || {}),
        [actionType]: true,
      };
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        📢 あなた向けの支援情報
        <span className="text-sm text-gray-500 ml-3">（{articles.length} 件）</span>
      </h1>

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
            <ArticleCard
              key={article.article_id}
              article={article}
              userId={userId}
              engaged={engaged[article.article_id]}
              onEngage={handleEngage}
            />
          ))}
        </div>
      )}

      <PaginationControls page={page} setPage={setPage} />
    </div>
  );
}