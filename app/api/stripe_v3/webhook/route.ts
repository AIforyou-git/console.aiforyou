import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


// ✅ NODE_ENVに応じてWebhook Secretを切り替える
const endpointSecret =
  process.env.NODE_ENV === "production"
    ? process.env.STRIPE_WEBHOOK_SECRET_PROD!
    : process.env.STRIPE_WEBHOOK_SECRET_DEV!;

export async function POST(req: NextRequest) {
  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig) throw new Error("Missing signature");

    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error("❌ Webhook署名エラー:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.user_id;
    const priceId = session.metadata?.price_id;

    if (!userId || !priceId) {
      console.warn("⚠ metadata に user_id または price_id がありません");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // プラン情報を取得（billing_cycle）
    const { data: planData, error: planError } = await supabaseAdmin
      .from("plans")
      .select("id, billing_cycle")
      .eq("stripe_price_id", priceId)
      .single();

    if (planError || !planData) {
      console.error("❌ プラン取得失敗:", planError?.message || "データなし");
      return NextResponse.json({ error: "Plan not found" }, { status: 500 });
    }

    // ユーザーのプランを更新
    const { error: userUpdateError } = await supabaseAdmin
      .from("users")
      .update({ plan: "premium" })
      .eq("id", userId);

    if (userUpdateError) {
      console.error("❌ ユーザープラン更新失敗:", userUpdateError.message);
      return NextResponse.json({ error: "User update failed" }, { status: 500 });
    }

    // サブスクリプション登録（重複防止）
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!existing?.length) {
      const { error: insertError } = await supabaseAdmin.from("subscriptions").insert([
        {
          user_id: userId,
          plan_id: planData.id,
          plan_type: planData.billing_cycle,
          payment_count: 0,
          cancel_scheduled: false,
          status: "active",
          stripe_subscription_id: session.subscription,
        },
      ]);

      if (insertError) {
        console.error("❌ サブスクリプション登録失敗:", insertError.message);
        return NextResponse.json({ error: "Subscription insert failed" }, { status: 500 });
      }
    } else {
      console.log("✅ 既存サブスクリプションあり、挿入スキップ");
    }
  }

  return NextResponse.json({ received: true });
}
