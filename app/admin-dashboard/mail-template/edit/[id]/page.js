'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function EditMailTemplatePage() {
  const { id } = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(`/api/mail-template/${id}`);
        const data = await res.json();
        setTemplate(data.template);
      } catch (err) {
        setError('テンプレートの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTemplate();
  }, [id]);

  const handleSave = async () => {
    if (!template.title || !template.content) {
      setError('タイトルと本文は必須です');
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/mail-template/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: template.title,
        subject: template.subject,
        from_address: template.from_address,
        content: template.content,
        logo_url: template.logo_url,
      }),
    });

    if (res.ok) {
      router.push('/admin-dashboard/mail-template');
    } else {
      setError('保存に失敗しました');
    }

    setSaving(false);
  };

  if (loading) return <p className="p-6">読み込み中...</p>;
  if (!template) return <p className="p-6 text-red-500">テンプレートが見つかりません</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">テンプレート編集</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">タイトル</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={template.title}
            onChange={(e) => setTemplate({ ...template, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">件名</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={template.subject || ''}
            onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">送信元アドレス</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={template.from_address || ''}
            onChange={(e) => setTemplate({ ...template, from_address: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">本文</label>
          <JoditEditor
            value={template.content}
            onChange={(newContent) =>
              setTemplate({ ...template, content: newContent })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium">ロゴ画像URL（任意）</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={template.logo_url || ''}
            onChange={(e) => setTemplate({ ...template, logo_url: e.target.value })}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  );
}
