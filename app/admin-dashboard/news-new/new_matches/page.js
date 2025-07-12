'use client';

import React, { useEffect, useState } from 'react';
import { getMatchingUsersForArticle } from '@/lib/matching/getMatchingUsersForArticle';
import { getPublishedTodayArticles } from '@/lib/matching/getPublishedTodayArticles';

export default function NewMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [checkedEmails, setCheckedEmails] = useState(new Set());
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const articles = await getPublishedTodayArticles();

      const results = await Promise.all(
        articles.map(async (article) => {
          const users = await getMatchingUsersForArticle(article);
          return {
            article_id: article.article_id,
            title: article.structured_title,
            agency: article.structured_agency,
            detail_url: article.detail_url, // 🆕 メールリンク用
            count: users.length,
            users,
            categoryEmpty: !article.structured_personal_category || article.structured_personal_category.length === 0,
          };
        })
      );

      setMatches(results);
      setLoading(false);
    };

    fetchMatches();
  }, []);

  const paginatedMatches = matches.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const toggleEmail = (email) => {
    setCheckedEmails((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(email)) {
        newSet.delete(email);
      } else {
        newSet.add(email);
      }
      return newSet;
    });
  };

  const handleSend = async () => {
    if (checkedEmails.size === 0) {
      alert('送信先が選択されていません');
      return;
    }

    const confirm = window.confirm(`以下の ${checkedEmails.size} 件に送信しますか？\n\n${[...checkedEmails].join('\n')}`);
    if (!confirm) return;

    const deliveries = [];

    for (const email of checkedEmails) {
      const relatedArticles = matches
        .filter(match =>
          match.users.some(u => (u.email_1 === email || u.email_2 === email))
        )
        .map(match => ({
  article_id: match.article_id,
  title: match.title,
  agency: match.agency,
  detail_url: match.detail_url,
  summary: match.structured_summary_extract, // ✅ 修正
  published_at: match.published_at,          // ✅ 修正
  application_period: match.structured_application_period // ✅ 修正
}));

      deliveries.push({ email, articles: relatedArticles });
    }

    try {
      const res = await fetch('/api/news-new/send-individual-mails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveries }),
      });

      const result = await res.json();
      alert(`送信結果：\n${result.message || '完了'}`);
      setCheckedEmails(new Set());
    } catch (err) {
      alert('送信に失敗しました');
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧠 本日公開記事のマッチング確認</h1>

      <div className="mb-6">
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          📤 選択した宛先に送信
        </button>
        <span className="ml-4 text-sm text-gray-600">
          選択件数: {checkedEmails.size}
        </span>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          {paginatedMatches.map((match, index) => (
            <div key={match.article_id} className="border rounded p-4 mb-4 bg-white shadow">
              <h2 className="text-lg font-semibold mb-1">
                No.{(page - 1) * itemsPerPage + index + 1} ｜ ID: {match.article_id}
              </h2>
              <p className="text-md font-semibold">
                {match.title}
                {match.categoryEmpty && (
                  <span className="ml-2 text-red-600 text-sm font-semibold">⚠ 業種未設定</span>
                )}
              </p>
              <p className="text-sm text-gray-600 mb-2">募集機関: {match.agency}</p>
              <p className="text-sm mb-2">マッチしたクライアント数: <strong>{match.count}</strong></p>

              {match.count > 0 && (
                <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                  {match.users.map((u, i) => {
                    const email = u.email_1 || u.email_2;
                    return (
                      <li key={i} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checkedEmails.has(email)}
                          onChange={() => toggleEmail(email)}
                          disabled={!email}
                        />
                        <span>{email || '(メールなし)'}（{u.prefecture} / {u.industry}）</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}

          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              前へ
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * itemsPerPage >= matches.length}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              次へ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
