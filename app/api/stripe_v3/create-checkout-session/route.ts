import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // 管理者クライアント

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { priceId, planId } = await req.json();

    if (!priceId || !planId) {
      return NextResponse.json({ error: "priceId と planId は必須です" }, { status: 400 });
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
      // NOTE: trial_from_plan は存在しないプロパティなので削除済み
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Stripe checkout error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
