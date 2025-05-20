import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // ✅ ① client_daily_matches から本日のマッチング取得
    const { data: matches, error: matchError } = await supabaseAdmin
      .from('client_daily_matches')
      .select('user_id, matched_articles, calculated_at')
      .eq('target_date', today);

    if (matchError) throw new Error('マッチング取得エラー: ' + matchError.message);
    if (!matches.length) return NextResponse.json([], { status: 200 });

    // ✅ ② ユーザー情報の取得
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, status');

    if (userError) throw new Error('ユーザー取得エラー: ' + userError.message);

    // ✅ ③ クライアント情報の取得
    const { data: clients, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('uid, region_prefecture, region_city, industry');

    if (clientError) throw new Error('クライアント取得エラー: ' + clientError.message);

    // ✅ ④ マッチング情報を整形して返す
    const results = matches
      .map(match => {
        const user = users.find(u => u.id === match.user_id && u.status === 'active');
        const client = clients.find(c => c.uid === match.user_id);
        if (!user || !client) return null;

        return {
          user_id: user.id,
          user_email: user.email,
          client_industry: client.industry,
          client_prefecture: client.region_prefecture,
          client_city: client.region_city,
          matched_articles: match.matched_articles,
        };
      })
      .filter(Boolean);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('APIエラー:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
