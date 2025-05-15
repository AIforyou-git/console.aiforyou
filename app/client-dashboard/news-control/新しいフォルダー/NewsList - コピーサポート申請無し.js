"use client";

import { useEffect, useState } from "react";
import scrapingClient from '@/lib/supabaseScrapingClient'; // ✅ 共通クライアントを使用



const keywordOptions = ["補助金", "災害", "設備投資", "人材育成"];
const areaOptions = ["全国", "北海道", "東京", "大阪", "福岡"];
const sortOptions = [
  { label: "構造化日（新しい順）", value: "structured_at" },
  { label: "タイトル（昇順）", value: "structured_title" },
];

export default function NewsControlPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const perPage = 20;

  const [keyword, setKeyword] = useState("");
  const [area, setArea] = useState("");
  const [sortBy, setSortBy] = useState("structured_at");
  const [ascending, setAscending] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = scrapingClient
        .from("jnet_articles_public")
        .select(
          `
          article_id,
          structured_title,
          structured_agency,
          structured_prefecture,
          structured_application_period,
          structured_summary_extract,
          structured_amount_max,
          detail_url
        `
        )
        .eq("structured_success", true);

      if (keyword) {
        query = query.or(
          `(structured_title.ilike.%${keyword}%,structured_summary_extract.ilike.%${keyword}%)`
        );
      }

      if (area === "東京") {
        query = query.in("structured_prefecture", ["東京都", "全国"]);
      } else if (area) {
        query = query.eq("structured_prefecture", area);
      }

      query = query.order(sortBy, { ascending });

      const { data, error } = await query.range(from, to);

      if (error) {
        console.error("記事の取得エラー:", error.message);
      } else {
        setArticles(data || []);
      }

      setLoading(false);
    };

    fetchArticles();
  }, [page, keyword, area, sortBy, ascending]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📢 配信候補記事一覧</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="キーワード検索（例：補助金, 雇用）"
          value={keyword}
          onChange={(e) => {
            setPage(0);
            setKeyword(e.target.value);
          }}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />

        <select
          value={area}
          onChange={(e) => {
            setPage(0);
            setArea(e.target.value);
          }}
          className="border px-3 py-2 rounded w-full md:w-1/4"
        >
          <option value="">エリア選択</option>
          {areaOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => {
            setPage(0);
            setSortBy(e.target.value);
            setAscending(e.target.value !== "structured_at");
          }}
          className="border px-3 py-2 rounded w-full md:w-1/4"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <span className="mr-2 font-semibold text-sm">おすすめキーワード:</span>
        {keywordOptions.map((word) => (
          <button
            key={word}
            className="text-sm bg-blue-100 text-blue-800 px-2 py-1 mr-2 rounded"
            onClick={() => {
              setPage(0);
              setKeyword(word);
            }}
          >
            {word}
          </button>
        ))}
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.article_id}
                className="p-4 border rounded-lg shadow-sm bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {article.structured_title || "（タイトル未定）"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {article.structured_agency || "機関不明"} /{" "}
                      {article.structured_prefecture || ""} /{" "}
                      {article.structured_application_period?.start || "未定"}
                    </p>
                    {article.structured_summary_extract && (
                      <p className="text-sm text-gray-700 mt-1">
                        {article.structured_summary_extract}
                      </p>
                    )}
                    {article.structured_amount_max && (
                      <p className="text-sm text-gray-600 mt-1">
                        💰 {article.structured_amount_max}
                      </p>
                    )}
                    <a
                      href={article.detail_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm mt-1 inline-block"
                    >
                      記事を見る
                    </a>
                    
                    
                    
</div>

                  </div>
                  
                </div>
                
              
            ))}
          </div>
          

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              disabled={page === 0}
            >
              ← 前へ
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              次へ →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
