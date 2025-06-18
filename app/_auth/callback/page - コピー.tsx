'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const processAuth = async () => {
      const hash = window.location.hash;
      console.log("▶️ URLハッシュ内容:", hash);

      const params = new URLSearchParams(hash.replace('#', ''));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      console.log("🪪 access_token:", access_token);
      console.log("🔄 refresh_token:", refresh_token);

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error('❌ setSession エラー:', error);
          router.push('/login?error=auth_failed');
        } else {
          router.push('/login/recover/reset-password');
        }
      } else {
        console.warn('❗ トークンが見つかりません');
        router.push('/login?error=token_missing');
      }
    };

    processAuth();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-700 text-sm">
      🔄 セッション認証中です...
    </div>
  );
}
