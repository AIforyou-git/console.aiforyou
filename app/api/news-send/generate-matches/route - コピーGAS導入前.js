import { supabase } from '@/lib/supabaseClient';
import scrapingSupabase from '@/lib/supabaseScrapingClient'; // ✅ default import に修正済み
import { NextResponse } from 'next/server';

export async function POST() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // ✅ クライアント一覧を取得（profile_completed = true）
  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('profile_completed', true);

  if (clientError) {
    console.error('❌ クライアント取得エラー:', clientError);
    return NextResponse.json({ error: clientError }, { status: 500 });
  }

  // ✅ 記事を scrapingSupabase から取得
  const { data: articles, error: articleError } = await scrapingSupabase
    .from('jnet_articles_public')
    .select('article_id, structured_prefecture, structured_city, structured_industry_keywords')
    .eq('send_today', true)
    .eq('visible', true);

  if (articleError) {
    console.error('❌ 記事取得エラー:', articleError);
    return NextResponse.json({ error: articleError }, { status: 500 });
  }

  const upserts = [];

  // ✅ クライアントごとにマッチ判定
  for (const client of clients) {
    const matchedIds = articles
      .filter(article => {
        const regionMatch =
          article.structured_prefecture === '全国' ||
          article.structured_prefecture === client.region_prefecture ||
          article.structured_city === client.region_city;

        const industryMatch = article.structured_industry_keywords?.some(kw =>
          (client.industry || '').includes(kw)
        );

        return regionMatch && industryMatch;
      })
      .map(a => a.article_id);

    if (matchedIds.length === 0) continue;

    upserts.push({
  user_id: client.uid, // ✅ 修正: client.id → client.uid
  target_date: today,
  matched_articles: matchedIds,
  calculated_at: new Date().toISOString(),
  source: 'admin',
});
  }

  // ✅ client_daily_matches に upsert
  const { error: upsertError } = await supabase
    .from('client_daily_matches')
    .upsert(upserts, { onConflict: ['user_id', 'target_date'] });

  if (upsertError) {
    console.error('❌ マッチ結果upsertエラー:', upsertError);
    console.error('📦 最初のupsertデータ:', JSON.stringify(upserts[0], null, 2));
    return NextResponse.json({ error: upsertError }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: upserts.length });
}
