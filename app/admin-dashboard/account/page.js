'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function AccountSettings() {
  const supabase = createBrowserSupabaseClient();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  const handlePasswordChange = async () => {
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('❌ 新しいパスワードと確認用パスワードが一致しません');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(`❌ エラー: ${error.message}`);
    } else {
      setMessage('✅ パスワードを更新しました');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">⚙️ アカウント設定（Admin）</h1>

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
        <label className="block text-sm font-medium mb-2">🔑 新しいパスワード</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">🔁 パスワード再入力</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      <button
        onClick={handlePasswordChange}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        パスワードを変更
      </button>

      {message && <p className="text-green-600 text-sm mt-4">{message}</p>}
      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

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
