'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AllArticlesPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [sortBy, setSortBy] = useState('structured_at')
  const [ascending, setAscending] = useState(false)
  const perPage = 20
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const from = page * perPage
      const to = from + perPage - 1

      let query = supabase
        .from('jnet_articles_public')
        .select('*')
        .order(sortBy, { ascending })

      if (search) {
        query = query.ilike('structured_title', `%${search}%`)
      }

      const { data, error } = await query.range(from, to)

      if (error) {
        console.error('取得エラー:', error.message)
      } else {
        setData(data)
      }

      setLoading(false)
    }

    fetch()
  }, [page, search, sortBy, ascending])

  const handleSort = (column) => {
    if (sortBy === column) {
      setAscending(!ascending)
    } else {
      setSortBy(column)
      setAscending(true)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🗂 データベース全件一覧（確認用）</h1>

      <input
        type="text"
        placeholder="タイトル or 概要で検索..."
        value={search}
        onChange={(e) => {
          setPage(0)
          setSearch(e.target.value)
        }}
        className="w-full px-3 py-2 border rounded mb-4"
      />

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          <div className="overflow-auto max-w-full">
            <table className="table-auto text-sm border w-full whitespace-normal">
              <thead className="bg-gray-100 text-left text-xs sticky top-0 z-10">
                <tr className="border-b">
                  {data[0] &&
                    Object.keys(data[0]).map((key) => (
                      <th
                        key={key}
                        className="px-3 py-2 border cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSort(key)}
                      >
                        {key}
                        {sortBy === key && (ascending ? ' ▲' : ' ▼')}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-blue-50 cursor-pointer border-b"
                    onClick={() => router.push(`/admin-dashboard/news-control/all/${row.article_id}`)}
                  >
                    {Object.values(row).map((value, j) => (
                      <td
                        key={j}
                        className="px-3 py-3 border text-sm break-words align-top max-w-[240px] w-[240px] overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {typeof value === 'object' && value !== null
                          ? JSON.stringify(value)
                          : value?.toString() || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
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
