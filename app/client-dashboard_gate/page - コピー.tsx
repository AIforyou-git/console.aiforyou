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

      // ✅ 条件分岐
      if (!stripe_customer_id && plan === 'start') {
        router.replace('/stripe_v3/plans');
      } else if (!stripe_customer_id && plan === 'free' && has_attempted_checkout) {
        router.replace('/error-page?msg=決済エラーが発生しました。サポートまでご連絡ください。');
      } else if (plan === 'premium') {
        router.replace('/client-dashboard');
      } else {
        router.replace('/client-dashboard/client-dashboard_checkin');
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
