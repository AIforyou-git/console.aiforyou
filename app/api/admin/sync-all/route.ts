// app/api/admin/sync-all/route.ts
import { NextResponse } from "next/server";
import { syncStripeCustomers } from "@/lib/stripeSync/syncCustomers";
import { syncStripeSubscriptions } from "@/lib/stripeSync/syncSubscriptions";
import { syncStripeInvoices } from "@/lib/stripeSync/syncInvoices";
import { updateSubscriptionsFromStripe } from "@/lib/stripeSync/updateSubscriptions";

export async function POST() {
  try {
    console.log("🔄 Stripe顧客データの同期開始...");
    await syncStripeCustomers();

    console.log("🔄 Stripe契約データの同期開始...");
    await syncStripeSubscriptions();

    console.log("🔄 Stripe請求書データの同期開始...");
    await syncStripeInvoices();

    console.log("🔄 Subscriptionsテーブルへの反映処理...");
    await updateSubscriptionsFromStripe();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ 同期処理エラー:", err.message);
    return NextResponse.json({ error: err.message || "同期に失敗しました" }, { status: 500 });
  }
}
