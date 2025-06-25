import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // ← apiVersion を削除

export async function syncStripeInvoices() {
  let hasMore = true;
  let startingAfter: string | undefined = undefined;
  const allInvoices: Stripe.Invoice[] = [];

  try {
    while (hasMore) {
      const response: Stripe.ApiList<Stripe.Invoice> = await stripe.invoices.list({
  limit: 100,
  starting_after: startingAfter,
});

      allInvoices.push(...response.data);
      hasMore = response.has_more;
      startingAfter =
        response.data.length > 0 ? response.data[response.data.length - 1].id : undefined;
    }

    for (const invoice of allInvoices) {
      const record = {
        stripe_invoice_id: invoice.id,
        stripe_customer_id: invoice.customer as string,
        stripe_subscription_id: invoice.subscription as string | null,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
        created: new Date(invoice.created * 1000).toISOString(),
        paid_at: invoice.status === "paid" ? new Date(invoice.created * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from("stripe_invoices")
        .upsert([record], { onConflict: "stripe_invoice_id" });

      if (error) {
        console.error("❌ stripe_invoices upsert failed:", invoice.id, error.message);
      } else {
        console.log("✅ stripe_invoices upsert:", invoice.id);
      }
    }
  } catch (err: any) {
    console.error("❌ syncStripeInvoices failed:", err.message);
  }
}
