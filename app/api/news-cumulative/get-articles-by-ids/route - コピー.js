import { scrapingSupabase } from '@/lib/supabaseScrapingClient';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { articleIds } = await req.json();

  if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
    return NextResponse.json({ error: 'articleIds is required and must be a non-empty array' }, { status: 400 });
  }

  const { data, error } = await scrapingSupabase
    .from('jnet_articles_public')
    .select('*')
    .in('article_id', articleIds);

  if (error) {
    console.error('❌ 記事取得エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 新着順にソート（published_at が新しい順）
  const sortedData = data.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  return NextResponse.json({ articles: sortedData });
}
