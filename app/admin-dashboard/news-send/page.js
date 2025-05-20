'use client';

//import React, { useEffect, useState } from 'react';

export default function NewsSendPage() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);
  const [articleMap, setArticleMap] = useState({}); // ✅ 記事ID → 詳細のマップ

  const handleForceRecalc = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/force-calc-matching', {
        method: 'POST',
      });
      if (!res.ok) {
        console.error('マッチング再生成APIエラー');
        alert('再計算に失敗しました');
        return;
      }
      await fetchTargets();
    } catch (err) {
      console.error('マッチング再生成エラー:', err);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

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

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news-send/get-today-targets');
      const data = await res.json();
      setTargets(data);

      // ✅ 記事IDを集約して1回のリクエストで取得
      const allArticleIds = data.flatMap(t => t.matched_articles);
      const uniqueIds = [...new Set(allArticleIds)];
      if (uniqueIds.length > 0) {
        const articleRes = await fetch(`/api/news-send/get-articles-by-ids`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: uniqueIds })
        });
        const articleData = await articleRes.json();
        const map = {};
        articleData.forEach(a => {
          map[a.article_id] = a;
        });
        setArticleMap(map);
      }
    } catch (err) {
      console.error('配信対象取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4">本日配信予定のマッチング確認</h1>

      <div className="flex gap-4 mb-4">
        <button
          onClick={handleForceRecalc}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          🛠 本日のマッチングを生成
        </button>

        <button
          onClick={fetchTargets}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          {loading ? '取得中...' : '📋 マッチングを取得'}
        </button>

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
                  {target.matched_articles.map((id) => {
                    const article = articleMap[id];
                    return article ? (
                      <li key={id}>
                        {article.structured_title}（{article.structured_agency}）
                      </li>
                    ) : (
                      <li key={id}>記事情報を取得できませんでした（ID: {id}）</li>
                    );
                  })}
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
