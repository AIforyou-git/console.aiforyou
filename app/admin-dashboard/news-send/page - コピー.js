'use client';

import React, { useEffect, useState } from 'react';

export default function NewsSendPage() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const res = await fetch('/api/news-send/get-today-targets');
        const data = await res.json();
        setTargets(data);
      } catch (err) {
        console.error('配信対象取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4">本日配信予定のマッチング確認</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : targets.length === 0 ? (
        <p className="text-sm text-gray-500">
          本日配信予定のユーザーは見つかりませんでした。
        </p>
      ) : (
        <div className="space-y-6">
          {targets.map((target) => (
            <div
              key={target.user_id}
              className="border p-4 rounded shadow-sm bg-white"
            >
              <h2 className="font-semibold text-lg mb-1">
                {target.user_email}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                業種: {target.client_industry} ／ 地域: {target.client_prefecture}
              </p>

              {target.matched_articles.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {target.matched_articles.map((article) => (
                    <li key={article.article_id}>
                      {article.title}（{article.agency}）
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-red-500 text-sm">マッチする記事がありません</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
