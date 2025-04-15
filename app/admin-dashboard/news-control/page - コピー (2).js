'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function NewsControlPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const perPage = 20

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      const from = page * perPage
      const to = from + perPage - 1

      const { data, error } = await supabase
        .from('jnet_articles_public')
        .select('article_id, structured_title, structured_agency, structured_prefecture, structured_application_period, structured_summary_extract, structured_amount_max, detail_url')
        .eq('structured_success', true) // ✅ 構造化済みのみ
        .order('structured_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('記事の取得エラー:', error.message)
      } else {
        setArticles(data)
      }
      setLoading(false)
    }

    fetchArticles()
  }, [page])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📢 配信候補記事一覧</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.article_id}
                className="p-4 border rounded-lg shadow-sm bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{article.structured_title || '（タイトル未定）'}</h2>
                    <p className="text-sm text-gray-500">
                      {article.structured_agency || '機関不明'} / {article.structured_prefecture || ''} / {article.structured_application_period?.start || '未定'}
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
                      記事を見る
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              disabled={page === 0}
            >
              ← 前へ
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              次へ →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
