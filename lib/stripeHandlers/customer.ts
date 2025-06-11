// lib/stripeHandlers/customer.ts
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Stripe customer イベントを処理して stripe_customers に保存
export async function handleCustomerEvent(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;

  const customerRecord = {
    stripe_customer_id: customer.id,
    email: customer.email || null,
    name: typeof customer.name === "string" ? customer.name : null,
    phone: typeof customer.phone === "string" ? customer.phone : null,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("stripe_customers")
    .upsert(customerRecord, {
      onConflict: "stripe_customer_id",
    });

  if (error) {
    console.error("❌ stripe_customers upsert failed:", error.message);
  } else {
    console.log(`✅ stripe_customers upsert success: ${customer.id}`);
  }
}
