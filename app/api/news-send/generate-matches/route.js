import { NextResponse } from "next/server";

import { createSupabaseRouteClient } from "../../../../lib/supabaseRouteClient";
import scrapingSupabase from "../../../../lib/supabaseScrapingClient";

export async function POST() {
  const supabase = createSupabaseRouteClient();

  const { data: clients, error: fetchError } = await supabase
    .from("clients")
    .select("uid, region_prefecture, region_full, match_by_city");

  if (fetchError || !clients) {
    console.error("❌ クライアント一覧取得失敗:", fetchError?.message);
    return NextResponse.json({ error: "クライアント取得エラー" }, { status: 500 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const today = todayStart.toISOString().slice(0, 10);

  const results = [];

  for (const client of clients) {
    const { uid, region_prefecture, region_full, match_by_city } = client;
    const areaTargets = match_by_city
      ? [region_full, "全国"]
      : [region_prefecture, "全国"];

    const { data: articles, error: articleError } = await scrapingSupabase
      .from("jnet_articles_public")
      .select("article_id")
      .eq("visible", true)
      .gte("published_at", todayStart.toISOString())
      .lte("published_at", todayEnd.toISOString())
      .in("structured_area_full", areaTargets);

    if (articleError) {
      console.error(`❌ [${uid}] 記事取得失敗:`, articleError.message);
      results.push({ user_id: uid, status: "error", message: "記事取得失敗" });
      continue;
    }

    const matchedIds = (articles || []).map(a => a.article_id);
    results.push({ user_id: uid, status: "fetched", count: matchedIds.length });
  }

  return NextResponse.json({ results }); // ✅ ループの外に配置
}
