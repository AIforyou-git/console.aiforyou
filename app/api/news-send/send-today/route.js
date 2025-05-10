import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMailToUser } from '@/lib/sendMail';

export async function POST() {
  // 1. マッチング済みデータの取得
  const { data: usersWithClients, error } = await supabaseAdmin
    .from('users')
    .select('id, email, clients ( industry, region_prefecture )');

  if (error) {
    console.error('ユーザー取得エラー:', error.message);
    return NextResponse.json({ error: 'ユーザー取得に失敗しました' }, { status: 500 });
  }

  const results = [];

  for (const user of usersWithClients) {
    const industry = user.clients?.industry;
    const region = user.clients?.region_prefecture;

    // マッチする記事を取得（send_today = true）
    const { data: articles, error: articleError } = await supabaseAdmin
      .from('jnet_articles_public')
      .select('*')
      .eq('send_today', true)
      .eq('visible', true)
      .ilike('structured_industry_keywords', `%${industry}%`)
      .ilike('structured_prefecture', `%${region}%`);

    if (articleError) {
      console.error('記事取得エラー:', articleError.message);
      continue;
    }

    if (articles.length === 0) {
      results.push({ user: user.email, status: 'スキップ（マッチなし）' });
      continue;
    }

    // 重複送信防止（既に送った記事を除外）
    const { data: sentLogs } = await supabaseAdmin
      .from('delivery_logs')
      .select('article_id')
      .eq('user_id', user.id);

    const sentIds = sentLogs?.map((log) => log.article_id) || [];

    const filteredArticles = articles.filter(
      (a) => !sentIds.includes(a.article_id)
    );

    if (filteredArticles.length === 0) {
      results.push({ user: user.email, status: 'スキップ（全て既送信）' });
      continue;
    }

    // 実際の送信処理
    const sendResult = await sendMailToUser({
      user,
      articles: filteredArticles,
    });

    results.push({
      user: user.email,
      status: sendResult.success ? '送信成功' : `送信失敗: ${sendResult.error}`,
    });
  }

  return NextResponse.json({ results });
}
