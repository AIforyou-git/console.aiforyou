'use client';
import React from 'react';
import { supabase } from '@/lib/supabaseBrowserClient';

const BulkPublishButton = ({ selectedIds, onSuccess }) => {
  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) return alert('記事が選択されていません');

    // ✅ 公開処理のみ実行
    const { error } = await supabase
      .from('jnet_articles_public')
      .update({
        visible: true,
        send_today: true,
        published_at: new Date().toISOString(),
      })
      .in('article_id', selectedIds);

    if (error) {
      alert('公開に失敗しました: ' + error.message);
      return;
    }

    alert('選択された記事を公開しました');
    onSuccess?.();
  };

  return (
    <button
      onClick={handleBulkPublish}
      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
    >
      ✅ 選択記事をまとめて公開する
    </button>
  );
};

export default BulkPublishButton;
