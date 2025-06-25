// /app/api/admin/recover-invoices/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // ← apiVersionを削除

export async function POST() {
  try {
    const { data: subs, error } = await supabaseAdmin
      .from("stripe_subscriptions")
      .select("stripe_subscription_id");

    if (error || !subs) {
      return NextResponse.json({ error: "Failed to fetch subscriptions", detail: error }, { status: 500 });
    }

    const inserted = [];
    const updated = [];
    const failed = [];

    for (const { stripe_subscription_id } of subs) {
      try {
        const invoices = await stripe.invoices.list({ subscription: stripe_subscription_id, limit: 100 });

        for (const inv of invoices.data) {
          const record = {
            stripe_invoice_id: inv.id,
            stripe_subscription_id,
            amount_paid: inv.amount_paid,
            status: inv.status,
           // paid_at: inv.status === "paid" && inv.paid_at
           //   ? new Date(inv.paid_at * 1000).toISOString()
           //   : null,
              paid_at: inv.status === "paid" && inv.status_transitions?.paid_at
  ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
  : null,
            created_at: new Date().toISOString(),
          };

          const { error: upsertError } = await supabaseAdmin
            .from("stripe_invoices")
            .upsert(record, { onConflict: "stripe_invoice_id" });

          if (upsertError) {
            console.error(`Failed to upsert invoice: ${inv.id}`, upsertError);
          } else {
            if (inv.status === "paid") {
              updated.push(inv.id);
            } else {
              inserted.push(inv.id);
            }
          }
        }
      } catch (err) {
        console.warn(`❌ Error retrieving invoices for: ${stripe_subscription_id}`, err);
        failed.push(stripe_subscription_id);
      }
    }

    return NextResponse.json({
      insertedCount: inserted.length,
      updatedCount: updated.length,
      failedSubscriptions: failed,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected failure" }, { status: 500 });
  }
}
