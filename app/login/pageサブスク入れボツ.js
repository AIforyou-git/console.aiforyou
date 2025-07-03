'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function LoginSBPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage('');
    setIsLoggingIn(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('ログイン失敗:', error.message);
      setErrorMessage('❌ ログインに失敗しました。メールアドレスまたはパスワードを確認してください。');
      setIsLoggingIn(false);
      return;
    }

    const session = data.session;
    const userId = session?.user?.id;

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
      console.error('ユーザーデータ取得失敗:', userError);
      setErrorMessage('❌ ユーザー情報の取得に失敗しました。');
      setIsLoggingIn(false);
      return;
    }
    // ✅ subscriptions テーブルを更新（毎回ログイン時に実行）
try {
  //await supabase
  //  .from('subscriptions')
  //  .upsert({
   //   user_id: userId,
    //  email: userData.email,
    //  updated_at: new Date().toISOString(), // 任意：更新日時
   // });
    await supabase
  .from('subscriptions')
  .upsert({
    user_id: userId,
    email: userData.email,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: ['user_id'], // ← 明示することで user_id ベースで upsert 可能に
  });
} catch (e) {
  console.warn('subscriptions テーブルの upsert 失敗:', e.message);
}



    if (userData.status === 'pending') {
      const { error: updateError } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', userId);

      if (updateError) {
        console.warn('ステータス更新失敗:', updateError.message);
      }

      await supabase
        .from('referral_relations')
        .update({ referred_status: 'active' })
        .eq('referred_id', userId);
    }

    try {
      const { error: referralUpdateError } = await supabase
        .from('referral')
        .update({ referrer_email: userData.email })
        .eq('referrer_id', userId);

      if (referralUpdateError) {
        console.warn('referral.referrer_email の同期失敗:', referralUpdateError.message);
      }
    } catch (e) {
      console.error('紹介コード同期エラー:', e.message);
    }

    const now = new Date().toISOString();
    const deviceInfo = typeof navigator !== 'undefined' ? navigator.userAgent : null;

    await supabase
      .from('login_logs')
      .insert([
        {
          uid: userId,
          login_time: now,
          ip_address: null,
          device_info: deviceInfo,
        },
      ]);

        if (userData.role === "client") {
  // 💡 ロールが client の場合は必ず gate 経由で遷移させる
  router.replace("/client-dashboard_gate");
  return;
} else {
  const roleRedirects = {
    agency: '/agency-dashboard',
    user: '/user-dashboard',
    admin: '/admin-dashboard',
  };
  const redirectTo = roleRedirects[userData.role] || '/dashboard';
  router.replace(redirectTo);
}


  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6">ログイン</h1>

          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}

          <div className="space-y-4 text-left">
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoggingIn}
              required
            />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoggingIn}
              required
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoggingIn ? 'ログイン中...' : 'ログイン'}
          </button>

          <p className="mt-4 text-sm">
            <a href="/login/recover" className="text-blue-600 hover:underline">
              パスワードを忘れた方はこちら
            </a>
          </p>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 py-4">
      <Link href="/legal/service" className="hover:underline mx-2">サービス</Link> 
        <Link href="/legal/terms" className="hover:underline mx-2">利用規約</Link>
        <Link href="/legal/privacy" className="hover:underline mx-2">プライバシーポリシー</Link>
        <Link href="/legal/tokusho" className="hover:underline mx-2">特定商取引法</Link>
      </footer>
    </>
  );
}
