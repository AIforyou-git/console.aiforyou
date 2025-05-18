'use client';
import React, { useState } from 'react';
import { handlePublishAndSync } from '@/lib/news/handlePublishAndSync';

const BulkPublishButton = ({ selectedIds, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) {
      alert('記事が選択されていません');
      return;
    }

    if (!confirm(`選択中の ${selectedIds.length} 件の記事を公開しますか？`)) return;

    setLoading(true);

    for (const id of selectedIds) {
      const result = await handlePublishAndSync(id);
      if (!result.success) {
        alert(`ID: ${id} の${result.step === 'publish' ? '公開' : 'UI同期'}処理に失敗：${result.error.message}`);
        setLoading(false);
        return;
      }
    }

    alert('すべての記事を公開＋UIキャッシュ同期しました');
    setLoading(false);
    onSuccess?.(); // reloadなどを親でトリガー
  };

  return (
    <button
      onClick={handleBulkPublish}
      disabled={loading}
      className={`mt-4 px-4 py-2 rounded text-white ${
        loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
      {loading ? '公開中...' : '✅ 選択記事をまとめて公開する'}
    </button>
  );
};

export default BulkPublishButton;
