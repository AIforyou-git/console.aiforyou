'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xtepytepaojyrjtlyccf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZXB5dGVwYW9qeXJqdGx5Y2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MDE0NTUsImV4cCI6MjA1ODM3NzQ1NX0.IsfbywYems3X494sLTPM5OgdEJkn4A1w7AJCu8tgJAo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function NewsList() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)

      try {
        const { data, error } = await supabase
          .from('jnet_articles')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50)

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
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">📰 配信候補記事</h2>

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
