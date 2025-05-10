'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function MailTemplateCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const handleSave = async () => {
    const res = await fetch('/api/mail-template/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, logo_url: logoUrl }),
    });

    if (res.ok) {
      router.push('/admin-dashboard/mail-template');
    } else {
      alert('保存に失敗しました');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">📄 新しいメールテンプレートを作成</h1>

      <label className="block mb-2 text-sm">タイトル</label>
      <input
        className="w-full border px-3 py-2 mb-4 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="block mb-2 text-sm">本文（HTML可）</label>
      <div className="mb-4 border rounded">
        <JoditEditor value={content} onChange={setContent} />
      </div>

      <label className="block mb-2 text-sm">ロゴ画像URL（任意）</label>
      <input
        className="w-full border px-3 py-2 mb-6 rounded"
        value={logoUrl}
        onChange={(e) => setLogoUrl(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        💾 保存
      </button>
    </div>
  );
}
