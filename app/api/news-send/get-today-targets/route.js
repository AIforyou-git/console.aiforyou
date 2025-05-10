import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabaseAdmin'; 

import scrapingClient from '@/lib/supabaseScrapingClient';     // 構造化記事DB（別接続）

export async function GET() {
  try {
    // ① 配信対象記事（今日送る予定）の取得
    const { data: articles, error: articleError } = await scrapingClient
      .from('jnet_articles_public')
      .select('article_id, structured_title, structured_agency, structured_prefecture, structured_industry_keywords')
      .eq('send_today', true)
      .eq('visible', true);

    if (articleError) throw new Error('記事取得エラー: ' + articleError.message);
    if (!articles.length) return NextResponse.json([], { status: 200 });

    // ② 全ユーザー情報を取得
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email');

    if (userError) throw new Error('ユーザー取得エラー: ' + userError.message);

    // ③ クライアント詳細情報を取得（地域・業種など）
    const { data: clients, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('uid, region_prefecture, industry');

    if (clientError) throw new Error('クライアント取得エラー: ' + clientError.message);

    // ④ 送信済みログを取得（重複防止用）
    const { data: logs, error: logError } = await supabaseAdmin
      .from('delivery_logs')
      .select('user_id, article_id');

    if (logError) throw new Error('ログ取得エラー: ' + logError.message);

    const sentSet = new Set(logs.map(log => `${log.user_id}_${log.article_id}`));

    // ⑤ マッチング処理
    const results = [];

    for (const user of users) {
      const clientInfo = clients.find(c => c.uid === user.id);
      if (!clientInfo) continue;

      const matched_articles = articles.filter(article => {
        const alreadySent = sentSet.has(`${user.id}_${article.article_id}`);
        const regionMatch = article.structured_prefecture === clientInfo.region_prefecture;
        const industryMatch = Array.isArray(article.structured_industry_keywords)
          ? article.structured_industry_keywords.includes(clientInfo.industry)
          : typeof article.structured_industry_keywords === 'string'
            ? article.structured_industry_keywords.includes(clientInfo.industry)
            : false;

        return regionMatch && industryMatch && !alreadySent;
      });

      results.push({
        user_id: user.id,
        user_email: user.email,
        client_industry: clientInfo.industry,
        client_prefecture: clientInfo.region_prefecture,
        matched_articles,
      });
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('APIエラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
