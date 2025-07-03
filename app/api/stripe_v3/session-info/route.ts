import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// 修正後（apiVersionを指定しない）
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "session_id が必要です" }, { status: 400 });
    }

    // 🔽 Checkout Session を取得
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("✅ Stripeセッション取得成功:", stripeSession.id);

    // 🔽 セッションから必要な情報を抽出
    const stripe_customer_id = stripeSession.customer as string;
    const stripe_subscription_id = stripeSession.subscription as string;

    let stripe_invoice_id = null;
    if (typeof stripeSession.invoice === "string") {
      stripe_invoice_id = stripeSession.invoice;
    }

    return NextResponse.json({
      stripe_customer_id,
      stripe_subscription_id,
      stripe_invoice_id,
    });
  } catch (err: any) {
    console.error("❌ セッション情報の取得に失敗:", err.message);
    return NextResponse.json({ error: "セッション情報取得に失敗しました" }, { status: 500 });
  }
}
