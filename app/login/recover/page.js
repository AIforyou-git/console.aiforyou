'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    setMessage('送信中...');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://console.aiforyou.jp/reset-password', // 必要に応じて変更
    });

    if (error) {
      setMessage('❌ エラー: ' + error.message);
    } else {
      setMessage('✅ パスワード再設定メールを送信しました。ご確認ください。');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center space-y-4">
        <h1 className="text-xl font-bold">パスワードをお忘れですか？</h1>
        <p className="text-sm text-gray-600">ご登録のメールアドレスを入力してください。再設定リンクをお送りします。</p>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
        />
        <button
          onClick={handleReset}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          再設定リンクを送信
        </button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </div>
    </div>
  );
}
