import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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
await supabase
  .from("stripe_customers")
  .update({ user_id })
  .eq("stripe_customer_id", stripe_customer_id)
  .is("user_id", null);




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
    });
  } catch (err: any) {
    console.error("❌ 補完処理エラー:", err);
    return NextResponse.json({ error: err.message || "内部エラー" }, { status: 500 });
  }
}
