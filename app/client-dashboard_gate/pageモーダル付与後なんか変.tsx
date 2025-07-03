'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authProvider';
import { supabase } from '@/lib/supabaseClient';
import ClientInfoForm from '../client-dashboard/ClientInfoForm'; // ✅ 同じディレクトリ内からの相対パス


export default function ClientDashboardGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
 // const [showModal, setShowModal] = useState(false); // ✅ モーダル表示制御

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
      // 🔽 client.profile_completed チェック追加（モーダルで止める）
//const { data: client, error: clientError } = await supabase
//  .from('clients')
//  .select('profile_completed')
//  .eq('uid', user.id)
//  .maybeSingle();

//if (clientError || !client || client.profile_completed !== true) {
//  setShowModal(true);
//  return;
//}

      

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

 // return (
 // <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg relative">
 //   {showModal ? (
 //     <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
  //      <div className="bg-white rounded-xl p-6 w-[95%] max-w-xl shadow-2xl">
  //        <ClientInfoForm onClose={() => setShowModal(false)} />
  //      </div>
  //    </div>
  //  ) : (
 //     <>🔄 アカウント情報を確認中です...</>
  //  )}
//  </div>
//);
}
