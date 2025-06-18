'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [tokenProcessed, setTokenProcessed] = useState(false);

  useEffect(() => {
    const processToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const type = params.get('type');

      if (token && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token });
        if (error) {
          console.error('verifyOtp エラー:', error);
          setMessage('❌ 認証に失敗しました。リンクが無効または期限切れです。');
        } else {
          setTokenProcessed(true);
        }
      } else {
        setMessage('❌ パスワード再設定リンクが無効か、トークンが見つかりません。');
      }
    };

    processToken();
  }, []);

  const handlePasswordUpdate = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage(`❌ パスワード更新失敗: ${error.message}`);
    } else {
      setMessage('✅ パスワードを更新しました。ログイン画面に移動します...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-center space-y-4">
        <h1 className="text-lg font-bold">🔐 新しいパスワードを設定</h1>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="新しいパスワード"
          className="w-full border px-4 py-2 rounded"
        />
        <button
          onClick={handlePasswordUpdate}
          disabled={!tokenProcessed || !newPassword}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          パスワードを更新する
        </button>
        {message && <p className="text-sm mt-2 text-red-600">{message}</p>}
      </div>
    </div>
  );
}
