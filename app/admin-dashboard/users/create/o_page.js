'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // ✅ supabaseClientをインポート

export default function CreateUserAdmin() {
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // 🔐 セッションからアクセストークン取得
      const session = (await supabase.auth.getSession()).data.session;

      if (!session) {
        setError('認証エラー：再ログインしてください。');
        return;
      }

      const token = session.access_token;

      const res = await fetch('/api/auth/register-sb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ トークンを付与！
        },
        body: JSON.stringify({ email, referralCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(`エラー: ${data.error || '登録に失敗しました'}`);
      } else {
        setSuccess('✅ 登録に成功しました！');
        setEmail('');
        setReferralCode('');
        setTimeout(() => {
          router.push('/admin-dashboard/users');
        }, 1000);
      }
    } catch (err) {
      console.error('Fatal Error:', err);
      setError('登録処理中にエラーが発生しました。');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">新規ユーザー登録（管理画面）</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <select
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">紹介コードを選択</option>
          <option value="HQ-ADMIN">管理者用</option>
          <option value="HQ-AGENCY">代理店用</option>
          <option value="HQ-USER">ユーザー用</option>
          <option value="HQ-CLIENT">クライアント用</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ユーザー登録
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">❌ {error}</p>}
      {success && <p className="text-green-600 mt-4">{success}</p>}
    </div>
  );
}
