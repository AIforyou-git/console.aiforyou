import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

console.log("🌍 NODE_ENV:", process.env.NODE_ENV);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "planId は必須です" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      console.error("❌ Authorization ヘッダーが存在しない");
      return NextResponse.json({ error: "トークンが見つかりません" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("❌ Supabase 認証エラー:", authError?.message);
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const { data: previousSubs } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .not("status", "eq", "canceled");

    const hasTrialed = previousSubs && previousSubs.length > 0;

    const currentEnv = process.env.NODE_ENV === "production" ? "production" : "test"; // ← ★環境を判定
    

    const { data: planData, error: planError } = await supabaseAdmin
      .from("plans")
      .select("stripe_price_id, trial_days")
      .eq("id", planId)
      .eq("env", currentEnv) // ← ★追加：環境ごとの制限
      .single();

    if (planError || !planData) {
      console.error("❌ プラン情報の取得失敗:", planError?.message || "データなし");
      return NextResponse.json({ error: "プラン情報が見つかりません" }, { status: 500 });
    }

    const priceId = planData.stripe_price_id;
    if (!priceId) {
      console.error("❌ stripe_price_id が未定義です");
      return NextResponse.json({ error: "Price ID が設定されていません" }, { status: 500 });
    }

    const trialPeriodDays =
      !hasTrialed && planData.trial_days && planData.trial_days > 0
        ? planData.trial_days
        : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email ?? undefined,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe_v3/thanks?price_id=${priceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe_v3/cancel`,
      metadata: {
        user_id: user.id,
        price_id: priceId,
        plan_id: planId,
      },
      subscription_data: trialPeriodDays
        ? { trial_period_days: trialPeriodDays }
        : undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Stripe checkout error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
