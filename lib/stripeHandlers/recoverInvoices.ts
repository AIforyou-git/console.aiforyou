// lib/stripeHelpers/recoverInvoices.ts
import Stripe from "stripe";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);



/**
 * Stripe から最新の invoice 情報を取得して Supabase に保存
 */
export async function tryRecoverInvoices(customerId: string, userId: string) {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10, // 必要に応じて増減
    });

    for (const invoice of invoices.data) {
      const subId = invoice.subscription as string;
      await supabaseAdmin.from("stripe_invoices").upsert({
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: subId,
        stripe_customer_id: invoice.customer as string, // 👈 追記部分
        amount_paid: invoice.amount_paid,
        status: invoice.status,
        paid_at: invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
          : null,
        created_at: new Date(invoice.created * 1000).toISOString(),
        user_id: userId,
      });
    }

    console.log(`✅ tryRecoverInvoices: ${invoices.data.length} 件を補完`);
  } catch (err: any) {
    console.error("❌ tryRecoverInvoices エラー:", err.message);
  }
}
