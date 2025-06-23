import { supabase } from "@/lib/supabaseClient";

/**
 * fetchSubscriptionDetail
 * 指定された userId に基づいて、サブスクリプション・Stripe情報をまとめて取得する
 */
export async function fetchSubscriptionDetail(userId: string) {
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (subscriptionError || !subscription) {
    console.error("subscription fetch error:", subscriptionError);
    return null;
  }

  const stripe_subscription_id = subscription.stripe_subscription_id;

  // ✅ stripe_subscription から customer_id を取りにいく
  const { data: stripeSubscription, error: subscriptionStripeError } = await supabase
    .from("stripe_subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripe_subscription_id)
    .maybeSingle();

  const stripe_customer_id = stripeSubscription?.stripe_customer_id || null;

  // stripeCustomer & invoices 並列取得
  const [
    { data: stripeCustomer, error: customerError },
    { data: stripeInvoices, error: invoiceError },
  ] = await Promise.all([
    stripe_customer_id
      ? supabase
          .from("stripe_customers")
          .select("*")
          .eq("stripe_customer_id", stripe_customer_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    supabase
      .from("stripe_invoices")
      .select("*")
      .eq("stripe_subscription_id", stripe_subscription_id)
      .order("created_at", { ascending: false }),
  ]);

  if (customerError || subscriptionStripeError || invoiceError) {
    console.error("fetch stripe data error:", {
      customerError,
      subscriptionStripeError,
      invoiceError,
    });
  }

  return {
    subscription,
    stripe_subscription: stripeSubscription ?? null,
    stripe_customer: stripeCustomer ?? null,
    stripe_invoices: stripeInvoices ?? [],
  };
}