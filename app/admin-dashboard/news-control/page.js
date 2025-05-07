'use client';

import React, { useState, useEffect } from 'react';
import scrapingClient from '@/lib/supabaseScrapingClient';
import Link from 'next/link'; // ✅ これが必要

export default function NewsControlPage() {
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState([]);
  const limit = 50;
  const [search, setSearch] = useState('');

const filteredArticles = articles.filter((a) =>
  a.structured_title?.toLowerCase().includes(search.toLowerCase())
);

useEffect(() => {
  const fetchArticles = async () => {
    const baseQuery = scrapingClient
      .from('jnet_articles_public')
      .select(`
        article_id,
        detail_url,
        structured_title,
        structured_agency,
        structured_prefecture,
        structured_city,
        structured_application_period,
        structured_industry_keywords,
        structured_grant_type,
        structured_purpose
      `);

    const query = search
      ? baseQuery.ilike('structured_title', `%${search}%`) // 🔍 検索時：全件対象
      : baseQuery.range((page - 1) * limit, page * limit - 1); // 通常：ページごと取得

    const { data, error } = await query;

    if (error) {
      console.error('Error:', error.message);
    } else {
      setArticles(data || []);
    }
  };

  fetchArticles();
}, [page, search]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold mb-4">構造化データ一覧</h1>

      {/* 🔍 検索フォーム */}
<div className="mb-4">
  <input
    type="text"
    placeholder="タイトル検索..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border px-3 py-1 rounded w-64"
  />
</div>

      <table className="table-auto w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
          <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">タイトル</th>
            <th className="border px-2 py-1">募集機関</th>
            <th className="border px-2 py-1">都道府県</th>
            <th className="border px-2 py-1">市区町村</th>
            <th className="border px-2 py-1">期間</th>
            <th className="border px-2 py-1">業種</th>
            <th className="border px-2 py-1">カテゴリ</th>
            <th className="border px-2 py-1">目的</th>
          </tr>
        </thead>
        <tbody>
        {articles
    .filter((a) =>
      a.structured_title?.toLowerCase().includes(search.toLowerCase())
    )
    .map((a) => (
            <tr key={a.article_id}>
            <td className="border px-2 py-1 text-center text-xs text-gray-600">
              {a.article_id}
            </td>
            <td className="border px-2 py-1">
              <Link href={`/admin-dashboard/news-control/edit/${a.article_id}`}>
                <span className="text-blue-600 underline cursor-pointer">
                  {a.structured_title}
                </span>
              </Link>
            </td>
              <td className="border px-2 py-1">{a.structured_agency}</td>
              <td className="border px-2 py-1">{a.structured_prefecture}</td>
              <td className="border px-2 py-1">{a.structured_city}</td>
              <td className="border px-2 py-1">
                {a.structured_application_period?.start} ～ {a.structured_application_period?.end}
              </td>
              <td className="border px-2 py-1">{(a.structured_industry_keywords || []).join(', ')}</td>
              <td className="border px-2 py-1">{a.structured_grant_type}</td>
              <td className="border px-2 py-1">
  {a.structured_purpose}
  {a.detail_url && (
    <div className="mt-2">
      <a
        href={a.detail_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-xs"
      >
        詳細を見る
      </a>
    </div>
  )}
</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          前へ
        </button>
        <span>ページ {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
