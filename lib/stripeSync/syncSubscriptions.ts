// lib/stripeSync/syncSubscriptions.ts

import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // ← apiVersion を削除

export async function syncStripeSubscriptions() {
  let hasMore = true;
  let startingAfter: string | undefined = undefined;
  const allSubscriptions: Stripe.Subscription[] = [];

  try {
    while (hasMore) {
     // const response = await stripe.subscriptions.list({
     //   limit: 100,
     //   starting_after: startingAfter,
     // });
      const response: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
  limit: 100,
  starting_after: startingAfter,
});

      allSubscriptions.push(...response.data);
      hasMore = response.has_more;
      startingAfter =
        response.data.length > 0
          ? response.data[response.data.length - 1].id
          : undefined;
    }

    for (const subscription of allSubscriptions) {
      const canceledAt = subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null;

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
        canceled_at: canceledAt,
        is_active:
          subscription.status === "active" || subscription.status === "trialing",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from("stripe_subscriptions")
        .upsert([record], { onConflict: "stripe_subscription_id" });

      if (error) {
        console.error(
          "❌ stripe_subscriptions upsert failed:",
          subscription.id,
          error.message
        );
      } else {
        console.log("✅ stripe_subscriptions upsert:", subscription.id);
      }
    }
  } catch (err: any) {
    console.error("❌ syncStripeSubscriptions failed:", err.message);
  }
}
