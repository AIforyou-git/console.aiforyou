'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ThanksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("🔁 ThanksPage useEffect start");
    console.log("🔍 URL params:", Array.from(searchParams.entries()));

    const storeStripeCustomerId = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        console.warn("❗ session_id がURLに見つかりません");
        return;
      }

      try {
        const res = await fetch(`/api/stripe_v3/session-info?session_id=${sessionId}`);
        const result = await res.json();

        if (result.stripe_customer_id) {
          // 🔑 セッションを明示的に復元（これが重要）
          await supabase.auth.getSession();

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          console.log("👤 Supabase User:", user);
          if (userError) {
            console.warn("⚠️ getUser error:", userError.message);
          }

          if (user?.id) {
            // ✅ stripe_customer_id、has_attempted_checkout、plan を同時に保存
            const { error } = await supabase
              .from('users')
              .update({
                stripe_customer_id: result.stripe_customer_id,
                has_attempted_checkout: true, // ✅ Thanks通過により決済試行済みとする
                plan: 'premium' // ✅ 決済完了によりプランを premium に昇格
              })
              .eq('id', user.id);

            if (error) {
              console.error('❌ Supabase 更新失敗:', error.message);
            } else {
              console.log('✅ stripe_customer_id を保存しました:', result.stripe_customer_id);
            }
          } else {
            console.warn('❗ ユーザーが未認証です');
          }
        } else {
          console.warn('❗ stripe_customer_id の取得に失敗しました');
        }
      } catch (err) {
        console.error('❌ Thanksページ同期エラー:', err);
      }
    };

    storeStripeCustomerId();

    const timer = setTimeout(() => {
      router.push("/client-dashboard_gate");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 決済が完了しました！</h1>
      <p className="text-gray-700 text-center max-w-md">
        ご購入ありがとうございます。アカウントはまもなく有効になります。
        自動でプランが反映されますので、そのままお待ちください。
      </p>
      <p className="mt-6 text-sm text-gray-500">(5秒後に自動でダッシュボードへ移動します)</p>
    </div>
  );
}
