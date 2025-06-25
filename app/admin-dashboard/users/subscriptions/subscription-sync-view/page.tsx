"use client";

import { useEffect, useState } from "react";
import { fetchSubscriptionDetail } from "@/lib/fetchSubscriptionDetail";
import { supabase } from "@/lib/supabaseClient";

export default function SubscriptionSyncView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: subscriptions } = await supabase.from("subscriptions").select("*");
   // const { data: stripeSubs } = await supabase.from("stripe_subscriptions").select("*");
   // const { data: stripeCustomers } = await supabase.from("stripe_customers").select("*");
   // const { data: stripeInvoices } = await supabase.from("stripe_invoices").select("*");

    const { data: stripeSubs } = await supabase.from("stripe_subscriptions").select("*");
const { data: stripeCustomers } = await supabase.from("stripe_customers").select("*");
const { data: stripeInvoices } = await supabase.from("stripe_invoices").select("*");

if (!subscriptions || !stripeSubs || !stripeCustomers || !stripeInvoices) {
  setData([]);
  setLoading(false);
  return;
}

    if (!subscriptions) return null; // subscriptionsがnullの場合は早期リターン

    const combined = subscriptions.map((sub) => {
      const stripeSub = stripeSubs.find(s => s.stripe_subscription_id === sub.stripe_subscription_id);
      const stripeCustomer = stripeCustomers.find(c => c.stripe_customer_id === stripeSub?.stripe_customer_id);
      const invoices = stripeInvoices.filter(i => i.stripe_subscription_id === sub.stripe_subscription_id);
      const latestInvoice = invoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      return {
        email: sub.email,
        plan: sub.plan_type,
        status: sub.status,
        stripeStatus: stripeSub?.status || "-",
        invoiceCount: invoices.length,
        latestInvoiceStatus: latestInvoice?.status || "-",
        stripe_subscription_id: sub.stripe_subscription_id,
        stripe_customer_id: stripeSub?.stripe_customer_id || "-",
        invoice_paid_at: latestInvoice?.paid_at || "-",
        invoice_amount_paid: latestInvoice?.amount_paid || 0,
        customer_name: stripeCustomer?.name || "-",
        customer_email: stripeCustomer?.email || "-",
        customer_created_at: stripeCustomer?.created_at || "-",
        subscription_updated_at: stripeSub?.updated_at || "-",
        invoice_created_at: latestInvoice?.created_at || "-"
      };
    });
    setData(combined);
    setLoading(false);
  };

  const handleSync = async () => {
    // 🔽 請求情報だけでなく、すべての同期APIに変更
    await fetch("/api/admin/sync-all", { method: "POST" });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">課金情報の同期確認</h1>
      <button
        onClick={handleSync}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Stripeの顧客・契約・請求情報を再取得・同期
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">メール</th>
              <th className="p-2 border">プラン</th>
              <th className="p-2 border">状態</th>
              <th className="p-2 border">Stripe Status</th>
              <th className="p-2 border">Invoice 件数</th>
              <th className="p-2 border">最終 Invoice</th>
              <th className="p-2 border">Paid 日時</th>
              <th className="p-2 border">支払金額</th>
              <th className="p-2 border">Subscription ID</th>
              <th className="p-2 border">Customer ID</th>
              <th className="p-2 border">顧客名</th>
              <th className="p-2 border">顧客メール</th>
              <th className="p-2 border">Customer作成</th>
              <th className="p-2 border">Subscription更新</th>
              <th className="p-2 border">Invoice作成</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={15} className="p-4 text-center">読み込み中...</td></tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2 border whitespace-nowrap">{item.email}</td>
                  <td className="p-2 border">{item.plan}</td>
                  <td className="p-2 border">{item.status}</td>
                  <td className="p-2 border">{item.stripeStatus}</td>
                  <td className="p-2 border text-right">{item.invoiceCount}</td>
                  <td className="p-2 border">{item.latestInvoiceStatus}</td>
                  <td className="p-2 border whitespace-nowrap">{item.invoice_paid_at}</td>
                  <td className="p-2 border text-right">{item.invoice_amount_paid}</td>
                  <td className="p-2 border text-xs">{item.stripe_subscription_id}</td>
                  <td className="p-2 border text-xs">{item.stripe_customer_id}</td>
                  <td className="p-2 border text-xs">{item.customer_name}</td>
                  <td className="p-2 border text-xs">{item.customer_email}</td>
                  <td className="p-2 border text-xs">{item.customer_created_at}</td>
                  <td className="p-2 border text-xs">{item.subscription_updated_at}</td>
                  <td className="p-2 border text-xs">{item.invoice_created_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
