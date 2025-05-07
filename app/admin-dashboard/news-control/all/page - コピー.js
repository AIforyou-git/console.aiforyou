'use client';

import React, { useEffect, useState } from 'react';
import scrapingClient from '@/lib/supabaseScrapingClient';

export default function NewsControlAllPage() {
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await scrapingClient
        .from('jnet_articles_public')
        .select('*')
        .range(0, limit - 1);

      if (error) {
        console.error('取得エラー:', error.message);
        setData([]);
      } else {
        setData(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [limit]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">すべての記事データ</h1>

      <label className="text-sm mr-4">
        表示件数：
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="ml-2 border px-2 py-1 text-sm"
        >
          {[10, 50, 100, 500].map((n) => (
            <option key={n} value={n}>{n}件</option>
          ))}
        </select>
      </label>

      {loading ? (
        <div className="text-sm mt-4">読み込み中...</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="table-auto border-collapse border w-full text-xs">
            <thead>
              <tr>
                {data[0] && Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    className="border px-2 py-1 bg-gray-100 sticky top-0 z-10 whitespace-nowrap text-left"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.keys(data[0]).map((key) => (
                    <td key={key} className="border px-2 py-1 align-top">
                      {String(row[key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
