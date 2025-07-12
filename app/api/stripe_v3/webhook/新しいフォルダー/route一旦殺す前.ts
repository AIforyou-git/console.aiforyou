import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { handleSubscriptionEvent } from "@/lib/stripeHandlers/subscription";
import { handleInvoiceEvent } from "@/lib/stripeHandlers/invoice";
import { handleCustomerEvent } from "@/lib/stripeHandlers/customer";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
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

  switch (event.type) {
    case "customer.created":
    case "customer.updated":
      await handleCustomerEvent(event);
      break;

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const priceId = session.metadata?.price_id;
      const planIdMeta = session.metadata?.plan_id;

      if (!userId || !priceId || !planIdMeta) {
        console.warn("⚠ metadata に必要な情報が不足: user_id, price_id, plan_id");
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
      }

      const now = new Date().toISOString();
      const customerEmail = session.customer_email as string;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      const { data: planData, error: planError } = await supabaseAdmin
        .from("plans")
        .select("id, billing_cycle")
        .eq("stripe_price_id", priceId)
        .single();

      if (planError || !planData) {
        console.error("❌ プラン取得失敗:", planError?.message || "データなし");
        return NextResponse.json({ error: "Plan not found" }, { status: 500 });
      }

      const planId = planData.id;
      const planType = planData.billing_cycle;

      const { data: pastTrials } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("has_trialed", true);

      const isFirstTrial = !pastTrials || pastTrials.length === 0;

      const { error: rpcError } = await supabaseAdmin.rpc("apply_subscription_update", {
        p_user_id: userId,
        p_email: customerEmail,
        p_stripe_subscription_id: subscriptionId,
        p_stripe_customer_id: customerId,
        p_plan_id: planId,
        p_plan_type: planType,
        p_status: "active",
        p_payment_count: 0,
        p_cancel_scheduled: false,
        p_has_trialed: isFirstTrial,
        p_trial_started_at: isFirstTrial ? now : null,
        p_trial_type: isFirstTrial ? "initial" : "none"
      });

      if (rpcError) {
        console.error("❌ apply_subscription_update RPC エラー:", rpcError.message);
        return NextResponse.json({ error: "Subscription update failed" }, { status: 500 });
      }

      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionEvent(event);
      break;

    case "invoice.payment_succeeded":
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("🧾 受信した invoice オブジェクト:", JSON.stringify(invoice, null, 2));

      const parent = (invoice as any).parent;
      const subscriptionId =
        invoice.subscription ??
        (parent?.subscription_details?.subscription as string | undefined);

      if (!subscriptionId) {
        console.warn("⚠ サブスクリプションID取得失敗、invoice処理スキップ:", invoice.id);
        break;
      }

      const { data: existing, error } = await supabaseAdmin
        .from("stripe_subscriptions")
        .select("id, user_id")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

      if (!existing || error) {
        console.warn("⚠ サブスクリプション未登録、invoice処理スキップ:", subscriptionId);
        break;
      }

      const invoiceUserId = existing.user_id ?? null;

      await supabaseAdmin.from("stripe_invoices").upsert({
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: subscriptionId,
        amount_paid: invoice.amount_paid,
        status: invoice.status,
        paid_at: invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
          : null,
        created_at: new Date(invoice.created * 1000).toISOString(),
        user_id: invoiceUserId
      });

      // ✅ 支払い成功時にのみ premium に切り替え
      if (event.type === "invoice.payment_succeeded" || event.type === "invoice.paid") {
        const { error: confirmError } = await supabaseAdmin.rpc("confirm_subscription_payment", {
          p_stripe_subscription_id: subscriptionId
        });
        if (confirmError) {
          console.error("❌ confirm_subscription_payment RPC エラー:", confirmError.message);
        }
      }

      await handleInvoiceEvent(event);
      break;
    }

    default:
      console.log(`ℹ️ 未処理イベント: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
