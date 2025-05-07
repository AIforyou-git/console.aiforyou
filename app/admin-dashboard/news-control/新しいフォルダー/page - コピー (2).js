'use client';

import React, { useEffect, useState } from 'react';
import scrapingClient from '@/lib/supabaseScrapingClient';

export default function NewsControlPage() {
  const [articles, setArticles] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedArticle, setSelectedArticle] = useState(null);

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
              <button
                onClick={() => setSelectedArticle(article)}
                className="text-sm text-white bg-blue-500 px-3 py-1 rounded"
              >
                編集
              </button>
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
          </div>
        ))}
      </div>

      {/* 編集モーダル */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl overflow-y-auto max-h-screen relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">記事編集</h2>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">元データ</h3>
                <p><strong>タイトル：</strong>{selectedArticle.title}</p>
                <p><strong>地域：</strong>{selectedArticle.region}</p>
                <p><strong>概要：</strong>{selectedArticle.summary_extract}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">構造化（編集可）</h3>
                <label className="block mb-2">
                  <span className="text-gray-700">タイトル</span>
                  <input
                    className="w-full border px-2 py-1 mt-1"
                    defaultValue={selectedArticle.structured_title || ''}
                  />
                </label>
                <label className="block mb-2">
                  <span className="text-gray-700">地域</span>
                  <input
                    className="w-full border px-2 py-1 mt-1"
                    defaultValue={selectedArticle.structured_prefecture || ''}
                  />
                </label>
                <label className="block mb-2">
                  <span className="text-gray-700">概要</span>
                  <textarea
                    className="w-full border px-2 py-1 mt-1"
                    defaultValue={selectedArticle.structured_summary_extract || ''}
                  />
                </label>
              </div>
            </div>
            <button
              onClick={() => alert('保存処理は未実装')}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
