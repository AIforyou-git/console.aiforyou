import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

import { tryRecoverInvoices } from "@/lib/stripeHandlers/recoverInvoices";

/**
 * リクエスト: { user_id: string, stripe_customer_id: string }
 * 処理: 該当するstripe_subscriptions, stripe_invoices に user_id を付与
 */
export async function POST(req: NextRequest) {
  try {
    const { user_id, stripe_customer_id } = await req.json();

    if (!user_id || !stripe_customer_id) {
      return NextResponse.json({ error: "user_idとstripe_customer_idは必須です" }, { status: 400 });
    }
    // ✅ stripe_customers の user_id を補完
//await supabase
//  .from("stripe_customers")
//  .update({ user_id })
//  .eq("stripe_customer_id", stripe_customer_id)
//  .is("user_id", null);

// ✅ stripe_customers の id が null の行に UUID を補完
const { data: customersWithNullId } = await supabase
  .from("stripe_customers")
  .select("stripe_customer_id")
  .eq("stripe_customer_id", stripe_customer_id)
  .is("id", null);

for (const row of customersWithNullId ?? []) {
  await supabase
    .from("stripe_customers")
    .update({ id: uuidv4() })
    .eq("stripe_customer_id", row.stripe_customer_id)
    .is("id", null);
}

// ✅ stripe_customers の user_id を補完
await supabase
  .from("stripe_customers")
  .update({ user_id })
  .eq("stripe_customer_id", stripe_customer_id)
  .is("user_id", null);





  // ✅ stripe_subscriptions の id が null の行に UUID を補完
const { data: subscriptionsWithNullId } = await supabase
  .from("stripe_subscriptions")
  .select("stripe_subscription_id")
  .eq("stripe_customer_id", stripe_customer_id)
  .is("id", null);

for (const row of subscriptionsWithNullId ?? []) {
  await supabase
    .from("stripe_subscriptions")
    .update({ id: uuidv4() })
    .eq("stripe_subscription_id", row.stripe_subscription_id)
    .is("id", null);
}
  
  // stripe_subscriptions の user_id を補完
    const { error: subError } = await supabase
      .from("stripe_subscriptions")
      .update({ user_id })
      .eq("stripe_customer_id", stripe_customer_id)
      .is("user_id", null); // 既に埋まっているものは更新しない

    // 対象のstripe_subscription_idを取得
    const { data: subData, error: fetchSubError } = await supabase
      .from("stripe_subscriptions")
      .select("stripe_subscription_id")
      .eq("stripe_customer_id", stripe_customer_id);

    if (fetchSubError || !subData || subData.length === 0) {
      return NextResponse.json({ error: "対応する subscription が見つかりません" }, { status: 404 });
    }

    const stripeSubscriptionIds = subData.map((s) => s.stripe_subscription_id);




    // ✅ stripe_invoices の id が null の行に UUID を補完
const { data: invoicesWithNullId } = await supabase
  .from("stripe_invoices")
  .select("stripe_invoice_id")
  .in("stripe_subscription_id", stripeSubscriptionIds)
  .is("id", null);

for (const row of invoicesWithNullId ?? []) {
  await supabase
    .from("stripe_invoices")
    .update({ id: uuidv4() })
    .eq("stripe_invoice_id", row.stripe_invoice_id)
    .is("id", null);
}

    
    // stripe_invoices の user_id を補完
    const { error: invError } = await supabase
      .from("stripe_invoices")
      .update({ user_id })
      .in("stripe_subscription_id", stripeSubscriptionIds)
      .is("user_id", null); // 既に埋まっているものは更新しない

      // 🔁 Stripeからinvoiceをリカバリ
    await tryRecoverInvoices(stripe_customer_id, user_id);

    return NextResponse.json({
  message: "補完処理が完了しました",
  stripe_subscription_ids: stripeSubscriptionIds,
  updated: {
    customers: customersWithNullId?.length || 0,
    subscriptions: subscriptionsWithNullId?.length || 0,
    invoices: invoicesWithNullId?.length || 0,
  }
});



  } catch (err: any) {
    console.error("❌ 補完処理エラー:", err);
    return NextResponse.json({ error: err.message || "内部エラー" }, { status: 500 });
  }
}
