import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('client_cumulative_matches')
      .select('user_id, matched_articles, calculated_at, source')
      .order('calculated_at', { ascending: false });

    if (error) throw error;

    // 併せてユーザー情報取得（JOIN回避）
    const userIds = data.map((d) => d.user_id);
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select(`
        uid,
        region_prefecture,
        region_city,
        name,
        company,
        industry,
        position,
        profile_completed,
        region_full,
        industry_2
      `)
      .in('uid', userIds);

    if (clientError) throw clientError;

    const clientMap = Object.fromEntries(clients.map((c) => [c.uid, c]));

    const result = data.map((row) => {
      const c = clientMap[row.user_id] || {};
      return {
        uid: row.user_id,
        matched_articles: row.matched_articles,
        calculated_at: row.calculated_at,
        source: row.source,
        region_prefecture: c.region_prefecture || '',
        region_city: c.region_city || '',
        name: c.name || '',
        company: c.company || '',
        industry: c.industry || '',
        position: c.position || '',
        profile_completed: c.profile_completed || false,
        region_full: c.region_full || '',
        industry_2: c.industry_2 || '',
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('❌ クライアント取得エラー:', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
