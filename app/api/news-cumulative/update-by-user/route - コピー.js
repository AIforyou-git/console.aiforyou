import { scrapingSupabase } from '@/lib/supabaseScrapingClient';
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { uid } = await req.json();
  if (!uid) {
    return NextResponse.json({ error: 'uid is required' }, { status: 400 });
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('uid, region_prefecture, region_city, match_by_city, industry, industry_2')
    .eq('uid', uid)
    .single();

  if (clientError || !client) {
    console.error('❌ 指定ユーザー取得エラー:', clientError);
    return NextResponse.json({ error: clientError?.message || 'User not found' }, { status: 500 });
  }

  const { data: articles, error: articleError } = await scrapingSupabase
    .from('jnet_articles_public')
    .select('article_id, structured_prefecture, structured_city')
    .eq('visible', true);

  if (articleError) {
    console.error('❌ 記事取得エラー:', articleError);
    return NextResponse.json({ error: articleError.message }, { status: 500 });
  }

  const now = new Date().toISOString();
  const target_date = new Date().toISOString().slice(0, 10);

  const matched = articles.filter(article => {
    const prefectureMatch = article.structured_prefecture === client.region_prefecture;
    const cityMatch = article.structured_city === client.region_city;
    return (
      article.structured_prefecture === '全国' ||
      prefectureMatch ||
      (client.match_by_city && cityMatch)
    );
  });

  const matchedArticleIds = matched.map(a => a.article_id);

  const { error: upsertError } = await supabase
    .from('client_cumulative_matches')
    .upsert({
      user_id: client.uid,
      target_date,
      matched_articles: matchedArticleIds,
      calculated_at: now,
      source: 'client'
    });

  if (upsertError) {
    console.error('❌ upsertエラー:', upsertError);
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'ok', matched_count: matchedArticleIds.length });
}
