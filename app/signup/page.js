'use client';
import { useState } from 'react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    console.log("📩 Email:", email);
    console.log("🔗 ReferralCode:", referralCode);
  
    const res = await fetch('/api/auth/register-sb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, referralCode }), // ✅ ここを修正
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      setError(`エラー: ${data.error || '登録に失敗しました'}`);
    } else {
      setSuccess('登録に成功しました！');
      setEmail('');
      setReferralCode('');
    }
  };
  

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">紹介コード付き 新規登録（Supabase）</h1>
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
          <option value="">紹介コードを選択してください</option>
          <option value="HQ-ADMIN">管理者用（HQ-ADMIN）</option>
          <option value="HQ-AGENCY">代理店用（HQ-AGENCY）</option>
          <option value="HQ-CLIENT">クライアント用（HQ-CLIENT）</option>
          <option value="HQ-USER">ユーザー用（HQ-USER）</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          登録
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">❌ {error}</p>}
      {success && <p className="text-green-600 mt-4">✅ {success}</p>}
    </div>
  );
}
