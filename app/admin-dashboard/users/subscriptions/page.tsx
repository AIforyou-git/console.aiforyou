"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CancelSubscriptionButton from "@/components/Cancel/SubscriptionButton";
import dayjs from "dayjs";
import SubscriptionDetailModal from "@/components/SubscriptionDetailModal";
import { fetchSubscriptionDetail } from "@/lib/fetchSubscriptionDetail";

export default function SubscriptionsAdminPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filterPlan, setFilterPlan] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    fetchAllData(page);
  }, [page]);

  const handleRowClick = async (userId: string) => {
    setSelectedUserId(userId);
    try {
      const detail = await fetchSubscriptionDetail(userId);
      setDetailData(detail);
      setShowModal(true);
    } catch (err) {
      console.error("詳細取得に失敗", err);
      setError("詳細情報の取得に失敗しました。");
    }
  };

  const fetchAllData = async (currentPage: number) => {
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const [subsRes, stripeSubsRes, stripeCustomersRes, stripeInvoicesRes] = await Promise.all([
      supabase.from("subscriptions").select("*"),
      supabase.from("stripe_subscriptions").select("*"),
      supabase.from("stripe_customers").select("*"),
      supabase.from("stripe_invoices").select("*"),
    ]);

    if (subsRes.error || stripeSubsRes.error || stripeCustomersRes.error || stripeInvoicesRes.error) {
      console.error("取得エラー:", subsRes.error || stripeSubsRes.error || stripeCustomersRes.error || stripeInvoicesRes.error);
      setError("データ取得に失敗しました。");
      return;
    }

    const enriched = subsRes.data.map((sub) => {
      const stripeSub = stripeSubsRes.data.find(s => s.stripe_subscription_id === sub.stripe_subscription_id);
      const stripeCustomer = stripeCustomersRes.data.find(c => c.stripe_customer_id === stripeSub?.stripe_customer_id);
      const invoices = stripeInvoicesRes.data.filter(i => i.stripe_subscription_id === sub.stripe_subscription_id);
      const latestInvoice = invoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      const status = stripeSub?.status === "active" || stripeSub?.status === "trialing"
        ? (stripeSub.status === "trialing" ? "トライアル中" : "継続中")
        : stripeSub?.cancel_at_period_end
        ? "解約予約中"
        : stripeSub?.status === "canceled"
        ? "解約済み"
        : "停止中";

      const now = new Date();
      const trialEnd = stripeSub?.current_period_end ? new Date(stripeSub.current_period_end) : null;
      const inTrial = stripeSub?.status === "trialing" && trialEnd && now < trialEnd;
      const trialRemaining = inTrial ? Math.ceil((trialEnd!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      return {
        id: sub.id,
        email: stripeCustomer?.email || sub.email || "―",
        user_id: sub.user_id,
        plan_type: sub.plan_type,
        started_at: sub.started_at,
        trial: inTrial,
        trialRemaining,
        payment_count: invoices.length,
        status,
        stripe_subscription_id: sub.stripe_subscription_id,
      };
    });

    const filtered = enriched.filter((s) => {
      const matchPlan = filterPlan ? s.plan_type === filterPlan : true;
      const matchStatus = filterStatus ? s.status === filterStatus : true;
      return matchPlan && matchStatus;
    });

    setTotalPages(Math.ceil(filtered.length / pageSize));
    setSubscriptions(filtered.slice(from, to + 1));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">課金状況管理</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div>
          <label className="mr-2">プラン</label>
          <select
            value={filterPlan}
            onChange={(e) => {
              setFilterPlan(e.target.value);
              setPage(1);
              fetchAllData(1);
            }}
            className="border px-2 py-1 rounded"
          >
            <option value="">すべて</option>
            <option value="monthly">月額</option>
            <option value="12months">年間</option>
          </select>
        </div>
        <div>
          <label className="mr-2">状態</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
              fetchAllData(1);
            }}
            className="border px-2 py-1 rounded"
          >
            <option value="">すべて</option>
            <option value="継続中">継続中</option>
            <option value="トライアル中">トライアル中</option>
            <option value="解約予約中">解約予約中</option>
            <option value="解約済み">解約済み</option>
            <option value="停止中">停止中</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border rounded shadow bg-white">
          <thead className="bg-gray-100 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">メール</th>
              <th className="px-4 py-2 text-left">プラン</th>
              <th className="px-4 py-2 text-left">契約日</th>
              <th className="px-4 py-2 text-left">トライアル</th>
              <th className="px-4 py-2 text-left">支払い</th>
              <th className="px-4 py-2 text-left">状態</th>
              <th className="px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr
                key={sub.id}
                className="border-t text-sm cursor-pointer hover:bg-gray-100"
                onClick={() => handleRowClick(sub.user_id)}
              >
                <td className="px-4 py-2">{sub.email}</td>
                <td className="px-4 py-2">{sub.plan_type}</td>
                <td className="px-4 py-2">{dayjs(sub.started_at).format("YYYY/MM/DD")}</td>
                <td className="px-4 py-2">{sub.trial ? `残り${sub.trialRemaining}日` : "―"}</td>
                <td className="px-4 py-2">{sub.payment_count} 回</td>
                <td className="px-4 py-2">{sub.status}</td>
                <td className="px-4 py-2">
                  <CancelSubscriptionButton
                    subscription={sub}
                    isAdmin={true}
                    onComplete={() => fetchAllData(page)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center gap-2 text-sm">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          前へ
        </button>
        <span>{page} / {totalPages}</span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          次へ
        </button>
      </div>

      {showModal && detailData && (
        <SubscriptionDetailModal
          detail={detailData}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
