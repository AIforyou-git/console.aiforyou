'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CreateUserAdmin() {
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [targetRole, setTargetRole] = useState('client');
  const [referralCodes, setReferralCodes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // 🔄 自分の紹介コード一覧を取得
  useEffect(() => {
    const fetchReferralCodes = async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('referral')
        .select('code, target_role')
        .eq('referrer_id', user.id)
        .eq('valid', true);

      if (!error && data?.length > 0) {
        setReferralCodes(data);
      } else {
        console.error('紹介コードの取得に失敗:', error?.message);
      }
    };

    fetchReferralCodes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          referralCode,
          targetRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(`エラー: ${data.error || '登録に失敗しました'}`);
      } else {
        setSuccess('✅ 登録に成功しました！');
        setEmail('');
        setReferralCode('');
        setTargetRole('client');
        setTimeout(() => {
          router.push('/admin-dashboard/users');
        }, 1000);
      }
    } catch (err) {
      console.error('登録中にエラー:', err);
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
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">登録するロールを選択</option>
          <option value="admin">管理者用</option>
          <option value="agency">代理店用</option>
          <option value="user">ユーザー用</option>
          <option value="client">クライアント用</option>
        </select>

        <select
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">紹介コードを指定</option>
          {referralCodes.map((code) => (
            <option key={code.code} value={code.code}>
              {code.code}（{code.target_role}{code.code.startsWith('HQ') ? ' / 自分' : ''}）
            </option>
          ))}
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
