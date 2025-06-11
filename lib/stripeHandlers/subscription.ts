// lib/stripeHandlers/subscription.ts
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function handleSubscriptionEvent(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  if (!subscription.id || !subscription.customer) {
    console.warn("⚠️ Subscription ID または Customer ID が不足");
    return;
  }

  const record = {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    cancel_at: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    is_active: subscription.status === "active" || subscription.status === "trialing",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("stripe_subscriptions")
    .upsert([record], { onConflict: "stripe_subscription_id" });

  if (error) {
    console.error("❌ stripe_subscriptions upsert failed:", error.message);
  } else {
    console.log("✅ stripe_subscriptions updated:", subscription.id);
  }

  // ✅ subscriptions テーブルにも cancel_scheduled を同期
  const { error: subError } = await supabaseAdmin
    .from("subscriptions")
    .update({ cancel_scheduled: subscription.cancel_at_period_end })
    .eq("stripe_subscription_id", subscription.id);

  if (subError) {
    console.error("❌ subscriptions 更新失敗:", subError.message);
  } else {
    console.log("✅ subscriptions テーブルにも cancel_scheduled を同期:", subscription.id);
  }
}
