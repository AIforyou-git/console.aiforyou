'use client';

import { useEffect, useState } from 'react';
import scrapingClient from '@/lib/supabaseScrapingClient';
import { supabase } from '@/lib/supabaseClient';

export default function NewsControlPage() {
  const [articles, setArticles] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await scrapingClient
        .from('jnet_articles_public')
        .select(`
          article_id,
          structured_title,
          structured_agency,
          structured_prefecture,
          structured_application_period,
          structured_summary_extract,
          structured_amount_max,
          detail_url
        `)
        .order('structured_at', { ascending: sortOrder === 'asc' })
        .limit(100);

      if (error) {
        console.error('記事取得エラー:', error.message);
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
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ニュース構造化管理（申請サポート版）</h1>

      {/* フィルター */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <input
          type="text"
          placeholder="キーワード検索"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={selectedPrefecture}
          onChange={(e) => setSelectedPrefecture(e.target.value)}
          className="border px-3 py-2 rounded"
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
          className="border px-3 py-2 rounded"
        >
          <option value="desc">新しい順</option>
          <option value="asc">古い順</option>
        </select>
      </div>

      {/* 記事カード */}
      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <div
            key={article.article_id}
            className="p-4 border rounded-lg shadow-sm bg-white"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">
                  {article.structured_title || '（タイトル未定）'}
                </h2>
                <p className="text-sm text-gray-500">
                  {article.structured_agency || '機関不明'} /{' '}
                  {article.structured_prefecture || ''} /{' '}
                  {article.structured_application_period?.start || '未定'}
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
                  詳細を見る
                </a>

                {/* 申請サポート */}
                <div className="mt-2">
                  <button
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) {
                        alert('ログインが必要です。');
                        return;
                      }
                      const uid = user.id;
                      window.location.href = `/chat-module-sb?aid=${article.article_id}&uid=${uid}`;
                    }}
                    className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded flex items-center"
                  >
                    💬 申請サポート
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
