// app/api/stripe/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { origin } = new URL(req.url);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRODUCT_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("🔥 Stripe セッション作成エラー:", err.message);
    return new NextResponse(
      JSON.stringify({ error: `Stripe セッション作成失敗: ${err.message}` }),
      { status: 500 }
    );
  }
}
