import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import scrapingClient from '@/lib/supabaseScrapingClient';

export async function GET() {
  try {
    // ① 構造化記事の取得
    const { data: articles, error: articleError } = await scrapingClient
      .from('jnet_articles_public')
      .select(`
        article_id,
        structured_title,
        structured_agency,
        structured_prefecture,
        structured_city,
        structured_industry_keywords,
        visible,
        send_today,
        published_at
      `)
      .eq('send_today', true)
      .eq('visible', true)
      .not('published_at', 'is', null); // ✅ 公開済のみ対象

    if (articleError) throw new Error('記事取得エラー: ' + articleError.message);
    if (!articles.length) return NextResponse.json([], { status: 200 });

    // ② ユーザー情報の取得
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, status');

    if (userError) throw new Error('ユーザー取得エラー: ' + userError.message);

    // ③ クライアント情報の取得（地域・業種・市区町村）
    const { data: clients, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('uid, region_prefecture, region_city, industry, match_by_city');

    if (clientError) throw new Error('クライアント取得エラー: ' + clientError.message);

    // ④ 送信済ログ取得（重複送信防止）
    const { data: logs, error: logError } = await supabaseAdmin
      .from('delivery_logs')
      .select('user_id, article_id');

    if (logError) throw new Error('ログ取得エラー: ' + logError.message);

    const sentSet = new Set(logs.map(log => `${log.user_id}_${log.article_id}`));
    const results = [];

    // ⑤ マッチング処理
    for (const user of users) {
      if (user.status !== 'active') continue;

      const client = clients.find(c => c.uid === user.id);
      if (!client) continue;

      const matched_articles = articles.filter(article => {
        const alreadySent = sentSet.has(`${user.id}_${article.article_id}`);

        // 地域（大）: 都道府県 または 全国
        const regionMatch =
          article.structured_prefecture === client.region_prefecture ||
          article.structured_prefecture === '全国';

        // 地域（小）: 市区町村（match_by_city = true のときのみ）
        const cityMatch = client.match_by_city
          ? article.structured_city === client.region_city
          : true;

        // 業種: 両方が配列 → 1つでも一致
        const industryMatch =
          Array.isArray(client.industry) &&
          Array.isArray(article.structured_industry_keywords) &&
          client.industry.some(ind =>
            article.structured_industry_keywords.includes(ind)
          );

        return regionMatch && cityMatch && industryMatch && !alreadySent;
      });

      if (matched_articles.length > 0) {
        results.push({
          user_id: user.id,
          user_email: user.email,
          client_industry: client.industry,
          client_prefecture: client.region_prefecture,
          client_city: client.region_city,
          matched_articles,
        });
      }
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('APIエラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
