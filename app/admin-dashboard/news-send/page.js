'use client';

import React, { useEffect, useState } from 'react';

export default function NewsSendPage() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);

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

  const handleSendToday = async () => {
    setSending(true);
    setResults([]);

    try {
      const res = await fetch('/api/news-send/send-today', {
        method: 'POST',
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('送信処理エラー:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4">本日配信予定のマッチング確認</h1>

      <div className="mb-4">
        <button
          onClick={handleSendToday}
          disabled={sending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {sending ? '送信中...' : '📤 本日配信を実行'}
        </button>
      </div>

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

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">送信結果</h2>
          <ul className="list-disc pl-6 text-sm">
            {results.map((r, idx) => (
              <li key={idx}>
                <strong>{r.user}</strong>：{r.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
