"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import scrapingClient from "@/lib/supabaseScrapingClient"; // ✅ これを追加！

export default function HiddenArticlesPageT() {
  const [hiddenArticles, setHiddenArticles] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchHiddenArticles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from("user_engagement_logs")
        .select("article_id")
        .eq("user_id", user.id)
        .eq("action_type", "ignore")
        .eq("action_value", true);

      if (error) {
        console.error("非表示記事の取得エラー:", error.message);
        return;
      }

      const articleIds = data.map((d) => d.article_id);

      if (articleIds.length === 0) {
        setHiddenArticles([]);
        return;
      }

      const { data: articles, error: fetchError } = await scrapingClient
        .from("jnet_articles_public")
        .select("article_id, structured_title, detail_url")
        .in("article_id", articleIds);

      if (fetchError) {
        console.error("記事データの取得エラー:", fetchError.message);
        return;
      }

      setHiddenArticles(articles || []);
    };

    fetchHiddenArticles();
  }, []);

  const handleRestore = async (articleId) => {
    if (!userId) return;

    const { error } = await supabase
      .from("user_engagement_logs")
      .delete()
      .eq("user_id", userId)
      .eq("article_id", articleId)
      .eq("action_type", "ignore");

    if (error) {
      alert("復元に失敗しました");
      console.error("復元エラー:", error.message);
    } else {
      setHiddenArticles((prev) => prev.filter((a) => a.article_id !== articleId));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🚫 非表示にした記事</h1>
      {hiddenArticles.length === 0 ? (
        <p className="text-gray-600">非表示の記事はありません。</p>
      ) : (
        <ul className="space-y-3">
          {hiddenArticles.map((article) => (
            <li key={article.article_id} className="p-4 bg-white border rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">
                    {article.structured_title || "（タイトル未定）"}
                  </p>
                  <a
                    href={article.detail_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    記事を見る
                  </a>
                </div>
                <button
                  onClick={() => handleRestore(article.article_id)}
                  className="px-3 py-1 text-sm border border-gray-400 rounded hover:bg-gray-100"
                >
                  🔁 表示に戻す
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}