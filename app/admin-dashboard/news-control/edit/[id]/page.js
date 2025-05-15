'use client';

import React, { useEffect, useState } from 'react';
import { structuredFieldsMeta } from '../../_meta/structuredFieldsMeta'; // 追加
import { useRouter, useParams } from 'next/navigation';
import scrapingClient from '@/lib/supabaseScrapingClient';

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = useParams();
  const [showMetaModal, setShowMetaModal] = useState(false); // モーダル状態追加
  const numericId = Number(id);
  const [article, setArticle] = useState(null);
  const [formData, setFormData] = useState({
    structured_title: '',
    structured_agency: '',
    structured_prefecture: '',
    structured_city: '',
    structured_application_period: { start: '', end: '' },
    structured_industry_keywords: '',
    structured_grant_type: '',
    structured_purpose: '',
    structured_amount_description: '',
  });

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await scrapingClient
        .from('jnet_articles_public')
        .select('*')
        .eq('article_id', numericId)
        .single();

      if (error) {
        console.error('Error fetching article:', error.message);
      } else {
        setArticle(data);
        setFormData({
          structured_title: data.structured_title || '',
          structured_agency: data.structured_agency || '',
          structured_prefecture: data.structured_prefecture || '',
          structured_city: data.structured_city || '',
          structured_application_period: {
            start: data.structured_application_period?.start || '',
            end: data.structured_application_period?.end || '',
          },
          structured_industry_keywords: data.structured_industry_keywords?.join(', ') || '',
          structured_grant_type: data.structured_grant_type || '',
          structured_purpose: data.structured_purpose || '',
          structured_amount_description: data.structured_amount_description || '',
          visible: data.visible ?? false,
  send_today: data.send_today ?? false,
  admin_memo: data.admin_memo || '',
        });
      }
    };

    if (numericId) {
      fetchArticle();
    }
  }, [numericId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'structured_application_period_start' || name === 'structured_application_period_end') {
      setFormData((prev) => ({
        ...prev,
        structured_application_period: {
          ...prev.structured_application_period,
          [name === 'structured_application_period_start' ? 'start' : 'end']: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    const updatedData = {
      structured_title: formData.structured_title,
      structured_agency: formData.structured_agency,
      structured_prefecture: formData.structured_prefecture,
      structured_city: formData.structured_city,
      structured_application_period: {
        start: formData.structured_application_period.start,
        end: formData.structured_application_period.end,
      },
      structured_industry_keywords: formData.structured_industry_keywords
        .split(',')
        .map((kw) => kw.trim())
        .filter(Boolean),
      structured_grant_type: formData.structured_grant_type,
      structured_purpose: formData.structured_purpose,
      structured_amount_description: formData.structured_amount_description,
      
      visible: formData.visible,
send_today: formData.send_today,
admin_memo: formData.admin_memo,
    };

    const { error } = await scrapingClient
      .from('jnet_articles_public')
      .update(updatedData)
      .eq('article_id', numericId);

    if (error) {
      console.error('Error updating article:', error.message);
    } else {
      router.push('/admin-dashboard/news-control');
    }
  };

  if (!article) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
  <button
    onClick={() => setShowMetaModal(true)}
    className="text-sm text-blue-600 underline"
  >
    構造化カラムの説明を見る
  </button>
</div>
      
      <h1 className="text-xl font-bold mb-4">記事編集</h1>
      


      <div className="grid grid-cols-2 gap-6 text-sm">

        
        {/* 左側：元データ */}
        <div className="bg-gray-50 border rounded p-4 space-y-2">
          <h2 className="text-base font-semibold mb-2">元データ</h2>
          <p><strong>article_id：</strong>{article.article_id}</p>
          <p><strong>詳細URL：</strong>
            <a href={article.detail_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {article.detail_url}
            </a>
          </p>
          <p><strong>タイトル：</strong>{article.title}</p>
          <p><strong>募集機関：</strong>{article.agency}</p>
          <p><strong>地域（大）：</strong>{article.region_large}</p>
          <p><strong>地域（小）：</strong>{article.region_small}</p>
          <p><strong>期間開始：</strong>{article.start_date}</p>
          <p><strong>期間終了：</strong>{article.end_date}</p>
          <p><strong>取得日：</strong>{article.timestamp}</p>
        </div>

        {/* 右側：構造化データ（編集可能） */}
        <div className="border rounded p-4 space-y-4 bg-white">
          <h2 className="text-base font-semibold mb-2">構造化データ（編集）</h2>
          <p><strong>article_id：</strong>{article.article_id}</p>
          <p><strong>詳細URL：</strong>
            <a href={article.detail_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {article.detail_url}
            </a>
          </p>
          <label className="block">
            <span className="text-gray-700">タイトル</span>
            <input
              name="structured_title"
              className="w-full border px-2 py-1 mt-1"
              value={formData.structured_title}
              onChange={handleChange}
            />
          </label>
          {/* クライアント表示・配信制御フラグ */}
          <p className="text-sm text-gray-500 mb-2">
  ※通常は「クライアントに公開」と「本日配信対象に含める」を同時にONにしてください。<br />
  表示のみ・配信のみといった片方だけの設定は、原則として使用しません。
</p>
<label className="block mt-4">
  <span className="text-gray-700">クライアントに公開</span>
  <input
    type="checkbox"
    className="mt-1"
    checked={formData.visible}
    onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
  />
</label>

<label className="block mt-3">
  <span className="text-gray-700">本日配信対象に含める</span>
  <input
    type="checkbox"
    className="mt-1"
    checked={formData.send_today}
    onChange={(e) => setFormData({ ...formData, send_today: e.target.checked })}
  />
</label>

<label className="block mt-3">
  <span className="text-gray-700">管理メモ</span>
  <textarea
    className="w-full border px-2 py-1 mt-1"
    rows={2}
    value={formData.admin_memo}
    onChange={(e) => setFormData({ ...formData, admin_memo: e.target.value })}
  />
</label>



          <label className="block">
            <span className="text-gray-700">募集機関</span>
            <input
              name="structured_agency"
              className="w-full border px-2 py-1 mt-1"
              value={formData.structured_agency}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">地域（大）</span>
            <input
              name="structured_prefecture"
              className="w-full border px-2 py-1 mt-1"
              value={formData.structured_prefecture}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">地域（小）</span>
            <input
              name="structured_city"
              className="w-full border px-2 py-1 mt-1"
              value={formData.structured_city}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">期間（開始）</span>
            <input
              type="date"
              name="structured_application_period_start"
              className="w-full border px-2 py-1 mt-1"
              value={formData.structured_application_period.start}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">期間（終了）</span>
            <input
              type="date"
              name="structured_application_period_end"
              className="w-full border px-2 py-1 mt-1"
              value={formData.structured_application_period.end}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">業種</span>
            <input
              name="structured_industry_keywords"
              className="w-full border px-2 py-1 mt-1"
              value={formData.structured_industry_keywords}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">カテゴリ</span>
            <input
              name="structured_grant_type"
              className="w-full border px-2 py-1 mt-1"
              value={formData.structured_grant_type}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">目的</span>
            <textarea
              name="structured_purpose"
              className="w-full border px-2 py-1 mt-1"
              rows={3}
              value={formData.structured_purpose}
              onChange={handleChange}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">金額説明</span>
            <textarea
              name="structured_amount_description"
              className="w-full border px-2 py-1 mt-1"
              rows={2}
              value={formData.structured_amount_description}
              onChange={handleChange}
            />
          </label>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          保存
        </button>
        <button
          onClick={() => router.push('/admin-dashboard/news-control')}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          キャンセル
        </button>
      </div>
       {/* モーダル本体 */}
    {showMetaModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 w-[600px] max-h-[80vh] overflow-y-auto rounded shadow-lg">
          <h2 className="text-lg font-bold mb-4">構造化カラムの説明</h2>
          <table className="table-auto w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">カラム名</th>
                <th className="border px-2 py-1">説明</th>
                <th className="border px-2 py-1">重要度</th>
              </tr>
            </thead>
            <tbody>
              {structuredFieldsMeta.map((item) => (
                <tr key={item.key}>
                  <td className="border px-2 py-1 font-mono">{item.key}</td>
                  <td className="border px-2 py-1">{item.description}</td>
                  <td className="border px-2 py-1">{item.importance}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right mt-4">
            <button
              onClick={() => setShowMetaModal(false)}
              className="text-sm text-gray-600 hover:text-black"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
