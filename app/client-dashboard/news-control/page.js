'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

// ✅ 環境変数から Supabase の情報を読み込み
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function ClientNewsControlPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [router])

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

  const togglePublish = async (id, current) => {
    try {
      const { error } = await supabase
        .from('jnet_articles')
        .update({ is_published: !current })
        .eq('id', id)

      if (error) {
        alert('更新に失敗しました')
        console.error(error.message)
      } else {
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, is_published: !current } : a))
        )
      }
    } catch (err) {
      console.error('想定外エラー:', err.message)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📰 あなたの配信候補記事</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="p-4 border rounded-lg shadow-sm bg-white"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{article.title}</h2>
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
                  <button
                    className={`px-3 py-1 text-sm rounded ${
                      article.is_published
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300'
                    }`}
                    onClick={() => togglePublish(article.id, article.is_published)}
                  >
                    {article.is_published ? '配信対象' : '未配信'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
