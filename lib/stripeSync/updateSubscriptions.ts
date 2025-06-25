// lib/stripeSync/syncSubscriptions.ts
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // ← apiVersion を削除

export async function updateSubscriptionsFromStripe() {
  try {
    const subscriptions: Stripe.Subscription[] = [];
    let startingAfter: string | undefined = undefined;

    while (true) {
      //const response = await stripe.subscriptions.list({
      //  limit: 100,
      //  starting_after: startingAfter,
      //});
      const response: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
  limit: 100,
  starting_after: startingAfter,
});

      subscriptions.push(...response.data);

      if (!response.has_more) break;
      startingAfter = response.data[response.data.length - 1].id;
    }

    for (const sub of subscriptions) {
      const canceledAt = sub.canceled_at
        ? new Date(sub.canceled_at * 1000).toISOString()
        : null;

      const record = {
        stripe_subscription_id: sub.id,
        stripe_customer_id: sub.customer as string,
        status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_start: sub.current_period_start
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null,
        current_period_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        cancel_at: sub.cancel_at
          ? new Date(sub.cancel_at * 1000).toISOString()
          : null,
        canceled_at: canceledAt,
        is_active: sub.status === "active" || sub.status === "trialing",
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from("stripe_subscriptions")
        .upsert(record, { onConflict: "stripe_subscription_id" });

      if (error) {
        console.error("❌ stripe_subscriptions upsert failed:", error.message);
      } else {
        console.log("✅ stripe_subscriptions upsert success:", sub.id);
      }

      // subscriptions テーブルの cancel_scheduled, canceled_at, is_active を更新
      const { error: subError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          cancel_scheduled: sub.cancel_at_period_end,
          canceled_at: canceledAt,
          is_active: sub.status === "active" || sub.status === "trialing",
        })
        .eq("stripe_subscription_id", sub.id);

      if (subError) {
        console.error("❌ subscriptions 更新失敗:", subError.message);
      } else {
        console.log("✅ subscriptions テーブル更新:", sub.id);
      }
    }
  } catch (err: any) {
    console.error("❌ syncSubscriptions error:", err.message);
  }
}
