'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MailTemplateListPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/mail-template/list');
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch (err) {
        console.error('テンプレート取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4">メールテンプレート一覧</h1>

      <div className="mb-4">
        <Link
          href="/admin-dashboard/mail-template/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ➕ 新しいテンプレートを作成
        </Link>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : templates.length === 0 ? (
        <p className="text-sm text-gray-500">テンプレートはまだ登録されていません。</p>
      ) : (
        <ul className="space-y-2">
          {templates.map((tpl) => (
            <li
              key={tpl.id}
              className="border px-4 py-2 rounded bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-800">{tpl.title || '(無題テンプレート)'}</p>
                <p className="text-xs text-gray-500">ID: {tpl.id}</p>
              </div>
              <Link
                href={`/admin-dashboard/mail-template/edit/${tpl.id}`}
                className="text-sm text-blue-600 underline"
              >
                編集
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
