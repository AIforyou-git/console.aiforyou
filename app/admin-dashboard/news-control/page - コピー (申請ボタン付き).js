'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import scrapingClient from '@/lib/supabaseScrapingClient';
import { supabase } from '@/lib/supabaseClient'; // ✅ 追加

export default function NewsControlPage() {
  const [articles, setArticles] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await scrapingClient
        .from('jnet_articles_public')
        .select('*')
        .order('structured_at', { ascending: sortOrder === 'asc' })
        .limit(100);

      if (error) {
        console.error('Error:', error.message);
      } else {
        setArticles(data || []);
      }
    };

    fetchArticles();
  }, [sortOrder]);

  const filteredArticles = articles.filter((article) => {
    const keywordMatch =
      article.structured_title?.includes(searchKeyword) ||
      article.structured_summary_extract?.includes(searchKeyword);

    const prefectureMatch =
      !selectedPrefecture || article.structured_prefecture === selectedPrefecture;

    return keywordMatch && prefectureMatch;
  });

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-4">ニュース構造化管理</h1>

      {/* フィルター */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <input
          type="text"
          placeholder="キーワード検索"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="border px-3 py-1"
        />
        <select
          value={selectedPrefecture}
          onChange={(e) => setSelectedPrefecture(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="">都道府県を選択</option>
          {Array.from(new Set(articles.map((a) => a.structured_prefecture)))
            .filter(Boolean)
            .map((pref) => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="desc">新しい順</option>
          <option value="asc">古い順</option>
        </select>
      </div>

      {/* カード一覧 */}
      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <div key={article.article_id} className="border rounded p-4 text-sm bg-white shadow">
            <div className="flex justify-between items-start">
              <h2 className="text-base font-semibold">{article.structured_title || 'タイトル未設定'}</h2>
              <Link href={`/admin-dashboard/news-control/edit/${article.article_id}`}>
                <button className="text-sm text-white bg-blue-500 px-3 py-1 rounded">
                  編集
                </button>
              </Link>
            </div>
            <div className="text-gray-600 mt-1">{article.structured_prefecture}</div>
            <p className="mt-2">{article.structured_summary_extract}</p>
            <a
              href={article.detail_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-xs mt-2 block"
            >
              詳細を見る
            </a>
            {/* ✅ 申請サポートボタンの追加 */}
<button
  onClick={async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("ログインが必要です。");
      return;
    }
    const uid = user.id;
    window.location.href = `/chat-module-sb?aid=${article.article_id}&uid=${uid}`;
  }}
  className="mt-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded"
>
  💬 申請サポート
</button>


          </div>
        ))}
      </div>
    </div>
  );
}
