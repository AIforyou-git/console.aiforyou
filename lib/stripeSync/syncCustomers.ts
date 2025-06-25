// lib/stripeSync/syncCustomers.ts
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // ← apiVersion を削除

export async function syncStripeCustomers() {
  try {
    const customers: Stripe.Customer[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    // ページネーションで全件取得
    while (hasMore) {
      const response: Stripe.ApiList<Stripe.Customer> = await stripe.customers.list({
  limit: 100,
  starting_after: startingAfter,
});

      customers.push(...response.data);
      hasMore = response.has_more;
      startingAfter = response.data[response.data.length - 1]?.id;
    }

    // Upsert処理
    const upserts = customers.map((customer) => ({
      stripe_customer_id: customer.id,
      email: customer.email ?? null,
      name: typeof customer.name === "string" ? customer.name : null,
      phone: typeof customer.phone === "string" ? customer.phone : null,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from("stripe_customers")
      .upsert(upserts, { onConflict: "stripe_customer_id" });

    if (error) {
      console.error("❌ stripe_customers upsert failed:", error.message);
      throw new Error(error.message);
    }

    console.log(`✅ stripe_customers 同期完了: ${customers.length} 件`);
    return { success: true, count: customers.length };
  } catch (err: any) {
    console.error("❌ Stripe customer 同期エラー:", err.message);
    return { success: false, error: err.message };
  }
}
