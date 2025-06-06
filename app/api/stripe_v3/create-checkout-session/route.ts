import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // ✅ 管理者クライアント

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export async function POST(req: NextRequest) {
  try {
    const { priceId, planId } = await req.json(); // ✅ planId を追加で取得

    if (!priceId || !planId) {
      return NextResponse.json({ error: "priceId と planId は必須です" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "トークンが見つかりません" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (!user || authError) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email, // ✅ メールを表示用に追加
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe_v3/thanks?price_id=${priceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe_v3/cancel`,
      metadata: {
        user_id: user.id,
        price_id: priceId,
        plan_id: planId, // ✅ 必須: webhook 側で使用
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Stripe checkout error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
