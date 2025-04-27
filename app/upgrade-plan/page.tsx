"use client";
import { useRouter } from 'next/navigation';

export default function UpgradePlanPage() {
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1RI48hD5qWmp0L96WigF3WMB', // Stripe Price IDをここに入れる
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cancel`,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout開始エラー:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">この機能は有料プラン限定です</h1>
      <p className="text-lg mb-4 text-center">
        15日間の無料トライアル付きで、全機能をご利用いただけます。
        月額4,980円（年契約）プランに登録してご利用ください。
      </p>
      <button
        onClick={handleCheckout}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow-md"
      >
        プランに申し込む（今すぐ）
      </button>
    </div>
  );
}
