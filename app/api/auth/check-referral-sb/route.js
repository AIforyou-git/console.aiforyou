import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ valid: false, error: "紹介コードが指定されていません" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("referral")
    .select("referrer_id, target_role, valid, expires_at")
    .eq("code", ref)
    .single();

  if (error || !data || !data.valid) {
    return NextResponse.json({ valid: false, error: "無効な紹介コードです" }, { status: 400 });
  }

  // 有効期限チェック
  if (data.expires_at && new Date() > new Date(data.expires_at)) {
    return NextResponse.json({ valid: false, error: "紹介コードの有効期限が切れています" }, { status: 400 });
  }

  return NextResponse.json(
    {
      valid: true,
      referrerId: data.referrer_id,
      role: data.target_role,
    },
    { status: 200 }
  );
}
