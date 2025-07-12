// /api/news-new/get-published-today-articles/route.js

import { NextResponse } from 'next/server';
import scrapingClient from '@/lib/supabaseScrapingClient';

export async function GET() {
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

  const { data, error } = await scrapingClient
    .from('jnet_articles_public')
    .select(`
      article_id,
      structured_title,
      structured_agency,
      structured_prefecture,
      structured_city,
      structured_personal_category,
      published_at
    `)
    .eq('visible', true)
    .eq('send_today', true)
    .gte('published_at', `${today}T00:00:00+09:00`) // JST対応
    .lte('published_at', `${today}T23:59:59+09:00`)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('記事取得エラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
