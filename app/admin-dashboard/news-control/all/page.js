'use client';

import React, { useEffect, useState } from 'react';
import scrapingClient from '@/lib/supabaseScrapingClient';

export default function NewsControlAllPage() {
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // localStorage から復元
  useEffect(() => {
    const savedColumns = localStorage.getItem('visibleColumns');
    if (savedColumns) {
      setVisibleColumns(JSON.parse(savedColumns));
    }
  }, []);

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
        if (data && data.length > 0 && visibleColumns.length === 0) {
          setVisibleColumns(Object.keys(data[0]));
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [limit]);

  // localStorage へ保存
  useEffect(() => {
    localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const handleColumnToggle = (column) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">すべての記事データ</h1>

      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm">
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

        <button
          onClick={() => setShowColumnSelector(!showColumnSelector)}
          className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          カラム選択 {showColumnSelector ? '▲' : '▼'}
        </button>
      </div>

      {showColumnSelector && data.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          {Object.keys(data[0]).map((key) => (
            <label key={key} className="mr-2">
              <input
                type="checkbox"
                checked={visibleColumns.includes(key)}
                onChange={() => handleColumnToggle(key)}
                className="mr-1"
              />
              {key}
            </label>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-sm mt-4">読み込み中...</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="table-auto border-collapse border w-full text-xs">
            <thead>
              <tr>
                {visibleColumns.map((key) => (
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
                <tr
                  key={rowIndex}
                  className={
                    row['structured_success'] === false ? 'bg-red-100' : ''
                  }
                >
                  {visibleColumns.map((key) => (
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
