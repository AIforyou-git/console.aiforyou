import React from "react";
import dayjs from "dayjs";

interface SubscriptionDetailModalProps {
  detail: any;
  onClose: () => void;
}

export default function SubscriptionDetailModal({ detail, onClose }: SubscriptionDetailModalProps) {
  const subscription = detail?.subscription;
 

  const stripeSubscription = detail?.stripe_subscription;
const stripeCustomer = detail?.stripe_customer;
const stripeInvoices = detail?.stripe_invoices || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">詳細情報</h2>

        {/* Basic Info from subscriptions */}
        <div className="mb-4 space-y-1 text-sm">
          <div><strong>プラン:</strong> {subscription?.plan_type || "-"}</div>
          <div><strong>開始日:</strong> {subscription?.started_at ? dayjs(subscription.started_at).format("YYYY-MM-DD HH:mm") : "-"}</div>
          <div><strong>状態:</strong> {subscription?.status || "-"}</div>
          <div><strong>Stripe ID:</strong> {subscription?.stripe_subscription_id || "-"}</div>
        </div>

        {/* Stripe Customer */}
        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-1">Stripe Customer</h3>
          <pre className="bg-gray-100 p-2 text-xs overflow-x-auto rounded">
            {stripeCustomer ? JSON.stringify(stripeCustomer, null, 2) : "情報なし"}
          </pre>
        </div>

        {/* Stripe Subscription */}
        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-1">Stripe Subscription</h3>
          <pre className="bg-gray-100 p-2 text-xs overflow-x-auto rounded">
            {stripeSubscription ? JSON.stringify(stripeSubscription, null, 2) : "情報なし"}
          </pre>
        </div>

        {/* Stripe Invoices */}
        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-1">Stripe Invoices</h3>
          {stripeInvoices.length > 0 ? (
            <pre className="bg-gray-100 p-2 text-xs overflow-x-auto rounded">
              {JSON.stringify(stripeInvoices, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">請求情報はありません。</p>
          )}
        </div>
      </div>
    </div>
  );
}
