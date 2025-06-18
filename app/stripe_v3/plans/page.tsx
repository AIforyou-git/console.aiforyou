"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseBrowserClient";

const plans = [
  {
    id: process.env.NEXT_PUBLIC_PLAN_ID_MONTHLY ?? "",
    name: "クライアント月額プラン（トライアル付き）",
    description: "毎月請求されるクライアント向けの標準プランです。",
  },
  {
    id: process.env.NEXT_PUBLIC_PLAN_ID_YEARLY ?? "",
    name: "クライアント年間縛りプラン",
    description: "1年間の契約が必要な割引プランです。",
  },
  {
    id: process.env.NEXT_PUBLIC_PLAN_ID_AGENCY_YEARLY ?? "",
    name: "AG 年間プラン",
    description: "代理店専用の年間契約プランです。",
  },
  {
    id: process.env.NEXT_PUBLIC_PLAN_ID_TEST_FREE ?? "",
    name: "0円テストプラン",
    description: "テスト用の無料プランです。",
  },
];

export default function SelectPlanPage(): React.JSX.Element {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const handleCheckout = async (planId: string) => {
    setLoading(planId);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!session || sessionError) {
        throw new Error("セッション取得に失敗しました。ログインを確認してください。");
      }

      const res = await fetch("/api/stripe_v3/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "リダイレクトに失敗しました。");
      }
    } catch (err: any) {
      console.error("❌ Checkoutエラー:", err.message);
      setError("決済ページの遷移に失敗しました。時間を置いてお試しください。");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">プランを選択してください</h1>
      <p className="text-gray-600 mb-6">
        以下のプランのいずれかを選択し、Stripeの安全な決済ページへお進みください。
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="border rounded-xl p-6 shadow-sm text-left bg-white"
          >
            <h2 className="text-lg font-semibold text-emerald-800 mb-1">
              {plan.name}
            </h2>
            <p className="text-gray-700 mb-4">{plan.description}</p>
            <button
              onClick={() => handleCheckout(plan.id)}
              disabled={loading === plan.id}
              className="bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition disabled:opacity-50"
            >
              {loading === plan.id ? "処理中..." : "このプランを選択する"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
