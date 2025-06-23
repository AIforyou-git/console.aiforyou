// lib/fetchSubscriptionDetail.ts
import { supabase } from "@/lib/supabaseClient";

export async function fetchSubscriptionDetail(userId: string) {
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (subError || !subscription) throw new Error("subscription 取得失敗");

  const { data: stripeSub } = await supabase
    .from("stripe_subscriptions")
    .select("*")
    .eq("stripe_subscription_id", subscription.stripe_subscription_id)
    .maybeSingle();

  const { data: latestInvoice } = await supabase
    .from("stripe_invoices")
    .select("*")
    .eq("stripe_subscription_id", subscription.stripe_subscription_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    subscription,
    stripeSub,
    latestInvoice,
  };
}
