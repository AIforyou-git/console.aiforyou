'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function NewsList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('structured_at');
  const [isAsc, setIsAsc] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const maxPages = 5;

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);

      try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('jnet_articles_public')
          .select(
            'article_id, structured_title, structured_agency, structured_prefecture, structured_application_period, structured_summary_extract, structured_amount_max, detail_url'
          )
          .eq('structured_success', true)
          .order(sortKey, { ascending: isAsc })
          .range(from, to);

        if (keyword.trim() !== '') {
          query = query.or(`structured_title.ilike.%${keyword}%,structured_summary_extract.ilike.%${keyword}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('記事の取得エラー:', error.message);
        } else {
          setArticles(data);
        }
      } catch (err) {
        console.error('想定外エラー:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [sortKey, isAsc, keyword, page]);

  return (
    <div className="space-y-4">
      {/* 🔍 検索 & ソート UI */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <input
          type="text"
          placeholder="キーワード検索"
          className="border p-2 rounded"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1); // 検索時に1ページ目へ戻る
          }}
        />
        <select
          className="border p-2 rounded"
          value={sortKey}
          onChange={(e) => {
            setSortKey(e.target.value);
            setPage(1);
          }}
        >
          <option value="structured_at">更新日</option>
          <option value="structured_title">タイトル</option>
          <option value="structured_agency">発信元</option>
        </select>
        <button
          onClick={() => {
            setIsAsc(!isAsc);
            setPage(1);
          }}
          className="text-sm px-3 py-2 bg-gray-200 rounded"
        >
          {isAsc ? '昇順 ↑' : '降順 ↓'}
        </button>
      </div>

      {/* 📄 記事表示 */}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        articles.map((article) => (
          <div key={article.article_id} className="p-4 border rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{article.structured_title || '（タイトル未定）'}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  🏢 {article.structured_agency || '機関不明'}<br />
                  📍 {article.structured_prefecture || '地域未定'}<br />
                  📅 {article.structured_application_period?.start || '未定'}
                </p>
                {article.structured_summary_extract && (
                  <p className="text-sm text-gray-700 mt-2">
                    💬 {article.structured_summary_extract}
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
                  className="text-blue-600 underline text-sm mt-2 inline-block"
                >
                  記事を見る
                </a>
              </div>
            </div>
          </div>
        ))
      )}

      {/* ◀️▶️ ページネーション */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: maxPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 border rounded ${p === page ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
