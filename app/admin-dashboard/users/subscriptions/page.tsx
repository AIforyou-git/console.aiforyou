"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CancelSubscriptionButton from "@/components/Cancel/SubscriptionButton";
import dayjs from "dayjs";

type Subscription = {
  id: string;
  user_id: string;
  plan_type: string;
  started_at: string;
  current_period_start: string | null;
  canceled_at: string | null;
  cancel_scheduled: boolean;
  is_active: boolean;
  payment_count: number;
  stripe_subscription_id: string; // ✅ ←追加
  email?: string;
  trial?: boolean;
  trialRemaining?: number;
  status?: string;
};

type User = {
  id: string;
  email: string;
};

export default function SubscriptionsAdminPage() {
 const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
const [users, setUsers] = useState<User[]>([]);
const [error, setError] = useState<string>("");
const [page, setPage] = useState<number>(1);
const [totalPages, setTotalPages] = useState<number>(1);
const [filterPlan, setFilterPlan] = useState<string>("");
const [filterStatus, setFilterStatus] = useState<string>("");

  const pageSize = 20;

  useEffect(() => {
    fetchAllData(page);
  }, [page]);

  const fetchAllData = async (currentPage: number) => {
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const [subsRes, countRes, usersRes] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(0, 999),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true }),
      supabase.from("users").select("id, email"),
    ]);

    if (subsRes.error || usersRes.error || countRes.error) {
      console.error("取得エラー:", subsRes.error || usersRes.error || countRes.error);
      setError("データ取得に失敗しました。");
    } else {
      const userMap = new Map(usersRes.data.map((u) => [u.id, u.email]));
      const now = new Date();

      const enriched = subsRes.data.map((s) => {
        const trialEnd = s.current_period_start ? new Date(s.current_period_start) : null;
        const inTrial = trialEnd && now < trialEnd;
        const trialRemaining = inTrial ? Math.ceil((trialEnd!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

        
        const status = s.canceled_at
          ? "解約済み"
          : s.cancel_scheduled
          ? "解約予約中"
          : s.is_active
          ? "継続中"
          : "停止中";

        return {
          ...s,
          email: userMap.get(s.user_id) || "―",
          trial: inTrial,
          trialRemaining,
          status,
        };
      });

      const filtered = enriched.filter((s) => {
        const matchPlan = filterPlan ? s.plan_type === filterPlan : true;
        const matchStatus = filterStatus ? s.status === filterStatus : true;
        return matchPlan && matchStatus;
      });

      setTotalPages(Math.ceil(filtered.length / pageSize));
      setSubscriptions(filtered.slice(from, to + 1));
    }
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
              <tr key={sub.id} className="border-t text-sm">
                <td className="px-4 py-2">{sub.email}</td>
                <td className="px-4 py-2">{sub.plan_type}</td>
                <td className="px-4 py-2">
                  {dayjs(sub.started_at).format("YYYY/MM/DD")}
                </td>
                <td className="px-4 py-2">
                  {sub.trial ? `残り${sub.trialRemaining}日` : "―"}
                </td>
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
        <span>
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
