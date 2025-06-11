// lib/stripeHandlers/invoice.ts
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function handleInvoiceEvent(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  console.log("📥 Invoice Event Type:", event.type);
  console.log("🔎 Raw Invoice:", invoice);

  const stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  let stripeSubscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;

  // parent.subscription_details から subscription ID を補完（例: invoice.payment_succeeded で undefined の場合）
  //if (!stripeSubscriptionId && invoice.parent?.subscription_details?.subscription) {
  //  stripeSubscriptionId = invoice.parent.subscription_details.subscription;
  //}

  // 修正後（型回避のため any キャスト）
const invoiceAny = invoice as any;
if (!stripeSubscriptionId && invoiceAny.parent?.subscription_details?.subscription) {
  stripeSubscriptionId = invoiceAny.parent.subscription_details.subscription;
}

  // 必須チェック
  if (!stripeCustomerId || !stripeSubscriptionId) {
    console.warn("⚠️ Invoice lacks subscription or customer ID", {
      subscription: stripeSubscriptionId,
      customer: stripeCustomerId,
    });
    return;
  }

  // paid_at は status_transitions.paid_at（Unix timestamp）を ISO に変換
  const paidAt = invoice.status_transitions?.paid_at
    ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
    : null;

  const invoiceRecord = {
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: stripeSubscriptionId,
    amount_paid: invoice.amount_paid ?? 0,
    status: invoice.status ?? "unknown",
    paid_at: paidAt,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("stripe_invoices")
    .upsert(invoiceRecord, { onConflict: "stripe_invoice_id" });

  if (error) {
    console.error("❌ stripe_invoices upsert failed:", error.message);
  } else {
    console.log("✅ stripe_invoices upsert success:", invoice.id);
  }
}
