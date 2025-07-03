'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authProvider';
import { supabase } from '@/lib/supabaseClient';

export default function ClientDashboardGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) return;

      const { data: userData, error } = await supabase
        .from('users')
        .select('stripe_customer_id, plan, has_attempted_checkout')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !userData) {
        router.replace('/error-page?msg=ユーザー情報の取得に失敗しました');
        return;
      }

      const { stripe_customer_id, plan, has_attempted_checkout } = userData;

      // ✅ 許可される条件以外はすべてエラー
      if (plan === 'premium' && stripe_customer_id) {
        router.replace('/client-dashboard'); // 正常な有料ユーザー
      } else if (
        plan === 'free' &&
        stripe_customer_id === null &&
        has_attempted_checkout === false
      ) {
        router.replace('/client-dashboard/client-dashboard_checkin'); // 初回登録直後
      } else {
        router.replace('/error-page?msg=決済情報に不整合があります。サポートまでご連絡ください。'); // それ以外は全てエラー
      }
    };

    if (!loading) checkAccess();
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
      🔄 アカウント情報を確認中です...
    </div>
  );
}
