import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date'); // オプション：YYYY-MM-DD

  try {
    let query = supabaseAdmin
      .from('delivery_summaries')
      .select('*')
      .order('date', { ascending: false });

    if (date) {
      query = query.eq('date', date).limit(1);
    } else {
      query = query.limit(1);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ error: 'ログが見つかりません' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('❌ 配信ログ取得エラー:', err);
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
  }
}
