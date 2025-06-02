import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { articleIds } = await req.json();

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const { data, error } = await supabase
      .from('jnet_articles_public')
      .select('article_id, title, structured_agency')
      .in('article_id', articleIds);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error('❌ 記事取得エラー:', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
