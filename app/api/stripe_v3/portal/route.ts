// app/api/stripe_v3/portal/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    // 認証トークンを取得
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "トークンが見つかりません" }, { status: 401 });
    }

    // Supabaseでユーザー取得
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    // ユーザーの stripe_customer_id を取得
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.stripe_customer_id) {
      return NextResponse.json({ error: "Stripe顧客IDが見つかりません" }, { status: 400 });
    }

    // Customer Portal セッションを作成
const session = await stripe.billingPortal.sessions.create({
  customer: userData.stripe_customer_id,
  return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/client-dashboard`, // ← ここに戻るURLを明示
});

    // ポータルURLを返却
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Customer Portal エラー:", err.message);
    return NextResponse.json({ error: "内部エラーが発生しました" }, { status: 500 });
  }
}
