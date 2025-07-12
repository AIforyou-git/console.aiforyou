import { NextResponse } from 'next/server';
import scrapingClient from '@/lib/supabaseScrapingClient';

export async function POST(req) {
  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '記事IDが無効です' }, { status: 400 });
    }

    const { data, error } = await scrapingClient
      .from('jnet_articles_public')
      .select(`
        article_id,
        structured_title,
        structured_agency,
        structured_application_period,
        structured_summary_extract,
        structured_amount_max,
        detail_url,
        published_at
      `)
      .in('article_id', ids);

    if (error) {
      console.error('記事取得エラー:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('APIエラー:', err);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
