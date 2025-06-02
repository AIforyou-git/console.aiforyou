import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data: clients, error } = await supabase
    .from('client_cumulative_matches')
    .select(`
      user_id,
      matched_articles,
      calculated_at,
      source,
      users(email),
      clients(region_prefecture)
    `)
    .order('calculated_at', { ascending: false });

  if (error) {
    console.error('❌ クライアント取得エラー:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = clients.map((c) => ({
    uid: c.user_id,
    matched_articles: c.matched_articles || [],
    calculated_at: c.calculated_at,
    source: c.source,
    email: c.users?.email || '',
    region_prefecture: c.clients?.region_prefecture || '',
  }));

  return NextResponse.json(formatted);
}
