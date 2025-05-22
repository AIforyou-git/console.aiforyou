import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import scrapingClient from '@/lib/supabaseScrapingClient';

export async function POST() {
  try {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const startOfDay = `${todayStr}T00:00:00`;
    const endOfDay = `${todayStr}T23:59:59`;

    // ✅ 本日公開かつ配信対象の記事を取得
    const { data: articles, error: articleError } = await scrapingClient
      .from('jnet_articles_public')
      .select(`
        article_id,
        structured_title,
        structured_agency,
        structured_prefecture,
        structured_city,
        structured_area_full,
        structured_industry_keywords,
        visible,
        send_today,
        published_at
      `)
      .eq('visible', true)
      .eq('send_today', true)
      .gte('published_at', startOfDay)
      .lte('published_at', endOfDay);

    if (articleError) throw new Error('記事取得エラー: ' + articleError.message);

    // ✅ ユーザー・クライアント・配信ログを取得
    const [{ data: users, error: userError }, { data: clients, error: clientError }, { data: logs, error: logError }] = await Promise.all([
      supabaseAdmin.from('users').select('id, email, status'),
      supabaseAdmin.from('clients').select('uid, region_prefecture, region_city, region_full, industry, match_by_city, auto_mail_enabled'),
      supabaseAdmin.from('delivery_logs').select('user_id, article_id')
    ]);

    if (userError) throw new Error('ユーザー取得エラー: ' + userError.message);
    if (clientError) throw new Error('クライアント取得エラー: ' + clientError.message);
    if (logError) throw new Error('配信ログ取得エラー: ' + logError.message);

    const sentSet = new Set(logs.map(log => `${log.user_id}_${log.article_id}`));
    const insertItems = [];

    for (const user of users) {
      if (user.status !== 'active') continue;

      const client = clients.find(c => c.uid === user.id);
      if (!client || !client.auto_mail_enabled) continue;

      const matched_articles = articles
        .filter(article => {
          const alreadySent = sentSet.has(`${user.id}_${article.article_id}`);

          const regionMatch = client.match_by_city
            ? [client.region_full, '全国'].includes(article.structured_area_full)
            : [client.region_prefecture, '全国'].includes(article.structured_prefecture);

          const cityMatch = true;

          const industryMatch = true; // ← 今は industry 無視で進める指示による

          return regionMatch && cityMatch && industryMatch && !alreadySent;
        })
        .map(article => article.article_id); // ✅ article_id のみに変換

      insertItems.push({
        user_id: user.id,
        target_date: todayStr,
        matched_articles,
        calculated_at: new Date().toISOString(),
        source: 'admin'
      });
    }

    if (insertItems.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from('client_daily_matches')
        .upsert(insertItems, { onConflict: ['user_id', 'target_date'] });

      if (upsertError) throw new Error('client_daily_matches への保存エラー: ' + upsertError.message);
    }

    return NextResponse.json({ status: 'ok', count: insertItems.length }, { status: 200 });
  } catch (error) {
    console.error('マッチング再生成エラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
