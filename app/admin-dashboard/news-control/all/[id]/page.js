'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function ArticleDetailPage() {
  const params = useParams()
  const articleId = params.id
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('jnet_articles_public')
        .select('*')
        .eq('article_id', articleId)
        .single()

      if (error) {
        console.error('詳細取得エラー:', error.message)
      } else {
        setArticle(data)
      }
      setLoading(false)
    }

    fetchArticle()
  }, [articleId])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📄 詳細表示: article_id={articleId}</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : article ? (
        <div className="bg-white p-4 border rounded shadow">
          <table className="table-auto text-sm w-full">
            <tbody>
              {Object.entries(article).map(([key, value]) => (
                <tr key={key} className="border-b">
                  <td className="font-medium px-2 py-2 w-48">{key}</td>
                  <td className="px-2 py-2 break-words">
                    {typeof value === 'object' && value !== null
                      ? <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(value, null, 2)}</pre>
                      : value?.toString() || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>記事が見つかりませんでした。</p>
      )}
    </div>
  )
}
