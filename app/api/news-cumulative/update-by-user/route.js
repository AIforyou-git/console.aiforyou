
// ✅ こちらが必要

import { NextResponse } from 'next/server';

// ✅ 地域マッチ判定ロジック（adminと共通）
const isRegionMatch = (article, client) => {
  return (
    article.structured_prefecture === '全国' ||
    article.structured_prefecture === client.region_prefecture ||
    article.structured_city === client.region_city
  );
};

export async function POST(req) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const targetDate = new Date().toISOString().slice(0, 10);
    const calculatedAt = new Date().toISOString();

    // クライアント取得
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('uid, region_prefecture, region_city')
      .eq('uid', user_id)
      .single();

    if (clientError) throw clientError;

    // 記事取得
    const { data: articles, error: articleError } = await supabase
      .from('jnet_articles_public')
      .select('article_id, structured_prefecture, structured_city, visible')
      .eq('visible', true);

    if (articleError) throw articleError;

    const matched = articles
      .filter((a) => isRegionMatch(a, client))
      .map((a) => a.article_id);

    const { error: upsertError } = await supabase
      .from('client_cumulative_matches')
      .upsert(
        {
          user_id,
          target_date: targetDate,
          matched_articles: matched,
          calculated_at: calculatedAt,
          source: 'user',
        },
        { onConflict: ['user_id', 'target_date'] }
      );

    if (upsertError) throw upsertError;

    return NextResponse.json({ status: 'ok', count: matched.length });
  } catch (err) {
    console.error('❌ update-by-user エラー:', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
