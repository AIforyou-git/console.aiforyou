// D:\dev_all\vercel\console.aiforyou\lib\matching\logic-new.ts

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import scrapingClient from '@/lib/supabaseScrapingClient';

export async function runNewClientMatch() {
  console.log('▶️ [runNewClientMatch] 実行開始');

  const { data: clients, error: clientErr } = await supabaseAdmin
    .from('clients')
    .select('uid, region_prefecture, region_full, match_by_city, industry');

  if (clientErr) throw new Error('クライアント取得エラー: ' + clientErr.message);
  if (!clients || clients.length === 0) return [];

  const allMatches = [];

  for (const client of clients) {
    const { uid, region_prefecture, region_full, match_by_city, industry } = client;

    let articleQuery = scrapingClient
      .from('jnet_articles_public')
      .select('article_id')
      .eq('visible', true) // ✅ UIと一致：表示対象だけ
      .overlaps('structured_personal_category', [industry]); // ✅ 業種マッチ一致

    if (match_by_city && region_full) {
      // ✅ 地域マッチ：UIと同等の判定
      articleQuery = articleQuery.or(
        `structured_area_full.eq.${region_full},and(structured_prefecture.eq.${region_prefecture},structured_city.is.null),structured_prefecture.eq.全国`
      );
    } else {
      articleQuery = articleQuery.in('structured_prefecture', [region_prefecture, '全国']);
    }

    const { data: articles, error: articleErr } = await articleQuery;
    if (articleErr) {
      console.error(`❌ 記事取得エラー (client: ${uid}):`, articleErr.message);
      continue;
    }

    const articleIds = (articles || []).map((a) => a.article_id);
    if (articleIds.length === 0) continue;

    allMatches.push({
      user_id: uid,
      client_industry: industry,
      client_prefecture: region_prefecture,
      client_city: match_by_city ? region_full : null,
      matched_articles: articleIds,
    });
  }

  console.log(`✅ 新ロジック完了: ${allMatches.length} 件マッチ`);
  return allMatches;
}
