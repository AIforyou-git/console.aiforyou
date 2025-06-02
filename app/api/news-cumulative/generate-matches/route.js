import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

// ✅ 地域マッチ判定ロジック
const isRegionMatch = (article, client) => {
  return (
    article.structured_prefecture === '全国' ||
    article.structured_prefecture === client.region_prefecture ||
    article.structured_city === client.region_city
  );
};

export async function POST() {
  try {
    const targetDate = new Date().toISOString().slice(0, 10);
    const calculatedAt = new Date().toISOString();

    // ① すでにマッチ処理済みの user_id を取得
    const { data: processed, error: processedError } = await supabase
      .from('client_cumulative_matches')
      .select('user_id')
      .eq('target_date', targetDate);

    if (processedError) throw processedError;

    const processedUserIds = processed.map((row) => row.user_id);
    console.log(`🛑 既に処理済みのユーザー数: ${processedUserIds.length}`);

    // ② 未処理クライアント一覧取得
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('uid, region_prefecture, region_city');

    if (clientError) throw clientError;

    //const unprocessedClients = clients.filter(
    //  (c) => !processedUserIds.includes(c.uid)
    //);
    const unprocessedClients = clients; // ✅ 毎回全クライアントを処理
    console.log(`▶️ 未処理クライアント数: ${unprocessedClients.length}`);

    // ③ 記事一覧取得（可視対象のみ）
    const { data: articles, error: articleError } = await supabase
      .from('jnet_articles_public')
      .select('article_id, structured_prefecture, structured_city, visible')
      .eq('visible', true);

    if (articleError) throw articleError;
    console.log(`▶️ 記事取得: ${articles.length}件`);

    let successCount = 0;

    // ④ クライアントごとにマッチ判定して upsert
    for (const client of unprocessedClients) {
      const matched = articles
        .filter((a) => isRegionMatch(a, client))
        .map((a) => a.article_id);

      console.log(`📌 ${client.uid} に対するマッチ件数: ${matched.length}`);

      const { error: upsertError } = await supabase
        .from('client_cumulative_matches')
        .upsert(
          {
            user_id: client.uid,
            target_date: targetDate,
            matched_articles: matched,
            calculated_at: calculatedAt,
            source: 'admin',
          },
          { onConflict: ['user_id', 'target_date'] }
        );

      if (upsertError) {
        console.error('❌ マッチ結果 upsert エラー:', upsertError);
      } else {
        successCount++;
      }
    }

    console.log(`✅ マッチ保存完了: ${successCount}/${unprocessedClients.length} 件`);

    return NextResponse.json({ status: 'ok', saved: successCount });
  } catch (err) {
    console.error('❌ 全体処理エラー:', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
