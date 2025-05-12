// client-dashboard/news-control/components/ArticleFilters.jsx

"use client";

import React from "react";

const keywordOptions = ["補助金", "災害", "設備投資", "人材育成", "お気に入り"];
const areaOptions = ["全国", "北海道", "東京", "大阪", "福岡"];
const sortOptions = [
  { label: "更新日（新しい順）", value: "structured_at" },
  { label: "タイトル（昇順）", value: "structured_title" },
];

export default function ArticleFilters({
  keyword,
  setKeyword,
  area,
  setArea,
  sortBy,
  setSortBy,
  setAscending,
  showSearchOptions,
  setShowSearchOptions
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowSearchOptions(!showSearchOptions)}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          {showSearchOptions ? "🔽 検索オプションを隠す" : "▶ 検索オプションを表示"}
        </button>
      </div>

      {showSearchOptions && (
        <>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="キーワード検索（例：補助金, 雇用）"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="border px-3 py-2 rounded w-full md:w-1/3"
            />

            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="hidden"
            >
              <option value="">エリア選択</option>
              {areaOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setAscending(e.target.value !== "structured_at");
              }}
              className="border px-3 py-2 rounded w-full md:w-1/4"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <span className="mr-2 font-semibold text-sm">おすすめキーワード:</span>
            {keywordOptions.map((word) => (
              <button
                key={word}
                className="text-sm bg-blue-100 text-blue-800 px-2 py-1 mr-2 rounded"
                onClick={() => setKeyword(word)}
              >
                {word}
              </button>
            ))}
          </div>

          <div className="flex justify-end mb-4">
            <a
              href="/client-dashboard/hidden"
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              🚫 非表示にした記事一覧を見る
            </a>
          </div>
        </>
      )}
    </div>
  );
}