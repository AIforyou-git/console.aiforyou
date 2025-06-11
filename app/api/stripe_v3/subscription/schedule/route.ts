// app/api/stripe_v3/subscription/schedule.ts
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { subscription_id } = await req.json();

  if (!subscription_id) {
    return NextResponse.json({ error: "Missing subscription_id" }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Stripe定期課金のキャンセルを予約（次回更新時点で停止）
    const updatedSubscription = await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true,
    });

    // Supabaseに解約予約状態を反映
    const { error } = await supabase
      .from("subscriptions")
      .update({ cancel_scheduled: true })
      .eq("stripe_subscription_id", subscription_id);

    if (error) {
      console.error("❌ Supabase update error:", error.message);
      return NextResponse.json({ error: "Supabase update failed" }, { status: 500 });
    }

    console.log("✅ 解約予約成功:", subscription_id);
    return NextResponse.json({ success: true, subscription: updatedSubscription });
  } catch (err: any) {
    console.error("❌ Stripe error:", err.message);
    return NextResponse.json({ error: "Stripe update failed" }, { status: 500 });
  }
}
