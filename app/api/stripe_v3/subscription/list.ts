import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteClient } from "@/lib/supabaseRouteClient";
//import { createClient } from "@/lib/supabaseAdmin";
//import createClient from "@/lib/supabaseAdmin"; // ← default import に修正
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function GET() {
  const supabase = createRouteClient(); // 引数なしで呼び出し
  //const admin = createClient();
  const admin = supabaseAdmin; // ✅

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError || user.role !== "admin") {
      return NextResponse.json({ error: "許可されていない操作です" }, { status: 403 });
    }

    const { data, error } = await admin
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "一覧取得に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ subscriptions: data });
  } catch (err: any) {
    console.error("一覧APIエラー:", err);
    return NextResponse.json({ error: "内部エラーが発生しました。" }, { status: 500 });
  }
}
