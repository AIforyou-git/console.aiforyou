'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginSBPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const emailFromUrl = searchParams.get('email');
  const tempFromUrl = searchParams.get('temp');

  useEffect(() => {
    if (emailFromUrl && tempFromUrl) {
      setEmail(decodeURIComponent(emailFromUrl));
      setPassword(tempFromUrl);
    }
  }, [emailFromUrl, tempFromUrl]);

  const handleLogin = async () => {
    setErrorMessage('');
    setIsLoggingIn(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('ログイン失敗:', error.message);
      setErrorMessage('❌ ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。');
      setIsLoggingIn(false);
      return;
    }

    const userId = data.session?.user?.id;
    if (!userId) {
      setErrorMessage('❌ ユーザーIDの取得に失敗しました。');
      setIsLoggingIn(false);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, status, email')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !userData) {
      setErrorMessage('❌ ユーザー情報の取得に失敗しました。');
      setIsLoggingIn(false);
      return;
    }

    // 初回ログインならステータス更新
    if (userData.status === 'pending') {
      await supabase.from('users').update({ status: 'active' }).eq('id', userId);
      await supabase.from('referral_relations').update({ referred_status: 'active' }).eq('referred_id', userId);
    }

    await supabase
      .from('referral')
      .update({ referrer_email: userData.email })
      .eq('referrer_id', userId)
      .catch((e) => console.warn('紹介コード同期失敗:', e.message));

    await supabase.from('login_logs').insert([
      {
        uid: userId,
        login_time: new Date().toISOString(),
        ip_address: null,
        device_info: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      },
    ]);

    // ロールごとのリダイレクト
    if (userData.role === 'client') {
      router.replace('/client-dashboard_gate');
    } else {
      const roleRedirects = {
        agency: '/agency-dashboard',
        user: '/user-dashboard',
        admin: '/admin-dashboard',
      };
      router.replace(roleRedirects[userData.role] || '/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-300 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🔐 AIforyou ログイン</h1>
          <p className="text-sm text-gray-600 mt-1">仮パスワードでログインしてください</p>
        </div>

        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

        <div className="space-y-3 text-left">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoggingIn}
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoggingIn}
            required
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoggingIn ? 'ログイン中...' : '✅ ログインする'}
        </button>

        <p className="text-sm mt-4">
          <a href="/login/recover" className="text-blue-600 hover:underline">
            パスワードを忘れた方はこちら
          </a>
        </p>
      </div>
    </div>
  );
}
