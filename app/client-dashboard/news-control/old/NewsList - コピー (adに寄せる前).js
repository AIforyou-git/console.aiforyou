'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// ✅ 環境変数から Supabase の情報を読み込み
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function NewsList() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('timestamp')
  const [isAsc, setIsAsc] = useState(false)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)

      try {
        let query = supabase
          .from('jnet_articles')
          .select('*')
          .order(sortKey, { ascending: isAsc })
          .limit(50)

        if (keyword.trim() !== '') {
          // 検索：title または agency に部分一致
          query = query.ilike('title', `%${keyword}%`)
        }

        const { data, error } = await query

        if (error) {
          console.error('記事の取得エラー:', error.message)
        } else {
          setArticles(data)
        }
      } catch (err) {
        console.error('想定外エラー:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [sortKey, isAsc, keyword])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">📰 配信候補記事</h2>

      {/* 🔍 検索 & ソート UI */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <input
          type="text"
          placeholder="キーワード検索（タイトル）"
          className="border p-2 rounded"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="timestamp">日付順</option>
          <option value="title">タイトル順</option>
          <option value="agency">発信元順</option>
        </select>
        <button
          onClick={() => setIsAsc(!isAsc)}
          className="text-sm px-3 py-2 bg-gray-200 rounded"
        >
          {isAsc ? '昇順 ↑' : '降順 ↓'}
        </button>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        articles.map((article) => (
          <div
            key={article.id}
            className="p-4 border rounded-lg shadow-sm bg-white"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{article.title}</h3>
                <p className="text-sm text-gray-500">
                  {article.agency} / {article.region_large} / {article.start_date}
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  記事を見る
                </a>
              </div>
              <div>
                <span
                  className={`px-3 py-1 text-sm rounded ${
                    article.is_published
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300'
                  }`}
                >
                  {article.is_published ? '配信対象' : '未配信'}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
