import scrapingClient from '@/lib/supabaseScrapingClient';
import React from 'react';

export default async function NewsControlAllPage() {
  const { data, error } = await scrapingClient
    .from('jnet_articles_public')
    .select('*');

  if (error) {
    return <div>データ取得エラー: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">すべての記事データ</h1>

      <table className="table-auto w-full text-xs border">
        <thead>
          <tr>
            {data[0] && Object.keys(data[0]).map((key) => (
              <th key={key} className="border px-2 py-1">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.keys(row).map((key) => (
                <td key={key} className="border px-2 py-1">
                  {String(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
