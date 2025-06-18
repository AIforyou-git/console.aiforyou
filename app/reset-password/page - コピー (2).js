'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPasswordPage() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  // ✅ Supabaseのセッションがすでにあるかを確認（verifyOtpは不要）
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && session.user) {
        setIsSessionReady(true);
      } else {
        setMessage('❌ パスワード再設定リンクが無効か、セッションが見つかりません。');
      }
    };

    checkSession();
  }, []);

  const handlePasswordUpdate = async () => {
    setIsProcessing(true);
    setMessage('');

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setIsProcessing(false);

    if (error) {
      setMessage(`❌ パスワード更新失敗: ${error.message}`);
    } else {
      setMessage('✅ パスワードを更新しました。ログイン画面に移動します...');
      setTimeout(() => router.push('/login'), 2000);
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
          disabled={!isSessionReady || isProcessing || !newPassword}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isProcessing ? '更新中...' : 'パスワードを更新する'}
        </button>

        {message && <p className="text-sm mt-2 text-red-600">{message}</p>}
      </div>
    </div>
  );
}
