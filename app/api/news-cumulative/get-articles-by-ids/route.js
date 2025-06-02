import { NextResponse } from 'next/server';
import scrapingClient from '@/lib/supabaseScrapingClient'; // ✅ scraping用Supabaseクライアントを使用

export async function POST(req) {
  try {
    const { articleIds } = await req.json();

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const { data, error } = await scrapingClient
      .from('jnet_articles_public') // ✅ scraping側に存在するテーブル
      .select('article_id, title, structured_agency')
      .in('article_id', articleIds);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error('❌ 記事取得エラー:', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
