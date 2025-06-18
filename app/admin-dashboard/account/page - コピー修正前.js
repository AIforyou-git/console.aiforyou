'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function AccountSettings() {
  const supabase = createBrowserSupabaseClient();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || '');
      }
    };
    fetchUser();
  }, []);

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setMessage(`❌ エラー: ${error.message}`);
    } else {
      setMessage('✅ ご自身のメールアドレスにリセットメールを送信しました');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">⚙️ アカウント設定（Supabase）</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">📧 登録中のメールアドレス</label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm bg-gray-100"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">🔑 パスワードリセット</label>
        <p className="text-xs text-gray-500 mb-2">
          ※ 現在ログインしている管理者自身のメールアドレス宛に送信されます
        </p>
        <button
          onClick={handlePasswordReset}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          リセットメールを送信
        </button>
      </div>

      {message && <p className="text-sm text-green-700 font-medium mt-4">{message}</p>}

      <div className="mt-8">
        <Link href="/admin-dashboard">
          <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
            ← ダッシュボードに戻る
          </button>
        </Link>
      </div>
    </div>
  );
}
