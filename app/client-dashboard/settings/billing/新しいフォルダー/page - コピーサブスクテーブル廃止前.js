"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
// import CancelSubscriptionButton from "@/components/Cancel/SubscriptionButton"; // 👈 コメントアウト（残す）

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [accessToken, setAccessToken] = useState(""); // 👈 Supabaseトークン取得用

  useEffect(() => {
    const fetchToken = async () => {
      const { data } = await supabase.auth.getSession();
      setAccessToken(data?.session?.access_token ?? "");
    };
    fetchToken();
  }, []);

  useEffect(() => {
    const fetchAndSync = async () => {
      if (!user?.id) return;

      try {
        const syncRes = await fetch("/api/stripe_v3/stripe-sync", {
          method: "GET",
          headers: { "x-user-id": user.id },
        });

        if (!syncRes.ok) {
          console.warn("⚠️ Stripe同期失敗:", await syncRes.json());
        }

        const { data: client, error: clientError } = await supabase
          .from("clients")
          .select("*")
          .eq("uid", user.id)
          .maybeSingle();

        if (clientError) throw clientError;
        setClientData(client);

        const { data: sub, error: subError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subError) throw subError;

        setSubscription(sub);
      } catch (err) {
        console.error("❌ 契約情報取得エラー:", err?.message || err);
        setSubscriptionError("契約情報の取得に失敗しました。");
      } finally {
        setFetching(false);
      }
    };

    if (!loading) fetchAndSync();
  }, [user, loading]);

  if (loading || fetching) {
    return <div className="p-6 text-center text-gray-600">🔄 読み込み中...</div>;
  }

  if (!user || user.role !== "client") {
    return <div className="p-6 text-red-500">アクセス権がありません。</div>;
  }

  const status = subscription?.canceled_at
    ? "解約済み"
    : subscription?.cancel_scheduled
    ? "解約予約中"
    : ["active", "trialing"].includes(subscription?.status)
    ? "継続中"
    : "停止中";

  const trialStatus =
    subscription?.trial_type === "initial"
      ? `トライアル中（${dayjs(subscription.trial_started_at).add(1, "day").format("YYYY/MM/DD")}まで）`
      : "―";

  const nextBillingDate = subscription?.current_period_end
    ? dayjs(subscription.current_period_end).format("YYYY/MM/DD")
    : "―";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6 text-gray-800">ご契約内容の確認</h1>

      {subscriptionError && (
        <p className="text-red-600 mb-4 text-sm">{subscriptionError}</p>
      )}

      <FormField label="契約者名" value={clientData?.name || "―"} />
      <FormField label="メールアドレス" value={user.email} />
      <FormField label="プラン" value={subscription?.plan_type || "―"} />
      <FormField
        label="契約日"
        value={dayjs(subscription?.started_at).format("YYYY/MM/DD")}
      />
      <FormField label="状態" value={status} />
      <FormField label="トライアル" value={trialStatus} />
      <FormField label="次回請求予定日" value={nextBillingDate} />

      <div className="mt-10 text-sm bg-gray-100 p-4 rounded border border-gray-200">
        <p className="mb-3 text-gray-700">
          解約やカード変更をご希望の場合は、下記のボタンから手続きしてください。
        </p>

        {/* 👇 旧カスタムキャンセルボタンはコメントアウトで残す */}
        {/*
        <CancelSubscriptionButton
          subscription={subscription}
          isAdmin={false}
          onComplete={() => location.reload()}
          className="bg-red-500 text-white font-semibold px-4 py-2 rounded hover:bg-red-600 transition text-sm"
        />
        */}

        {/* 👇 Customer Portalボタンを新設 */}
        <button
          onClick={async () => {
            const res = await fetch("/api/stripe_v3/portal", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            const data = await res.json();
            if (data.url) {
              window.location.href = data.url;
            } else {
              alert("ポータルの生成に失敗しました");
            }
          }}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
        >
          カード変更・解約はこちら
        </button>
      </div>
    </div>
  );
}

function FormField({ label, value }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-800 text-sm">
        {value}
      </div>
    </div>
  );
}
