// app/api/admin/sync-stripe-tables/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
  const { error } = await supabaseAdmin.rpc("sync_stripe_tables");

  if (error) {
    console.error("❌ Stripe同期エラー:", error.message);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok", message: "Stripeデータを同期しました。" });
}
