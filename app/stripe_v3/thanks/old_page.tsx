'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ThanksPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/client-dashboard"); // ✅ 修正されたリダイレクト先
    }, 5000); // 5秒後に遷移

    return () => clearTimeout(timer); // クリーンアップ
  }, [router]);

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
