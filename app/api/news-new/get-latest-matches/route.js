import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // ✅ 最新の target_date を取得（降順で1件）
    const { data: latest, error: latestErr } = await supabaseAdmin
      .from('client_news_new_matches')
      .select('target_date')
      .order('target_date', { ascending: false })
      .limit(1)
      .single();

    if (latestErr || !latest) {
      throw new Error('最新のマッチング日が取得できません');
    }

    const latestDate = latest.target_date;

    // ✅ 最新日のマッチング情報を取得
    const { data: matches, error: matchError } = await supabaseAdmin
      .from('client_news_new_matches')
      .select('user_id, matched_articles, calculated_at')
      .eq('target_date', latestDate);

    if (matchError) throw new Error('マッチング取得エラー: ' + matchError.message);
    if (!matches || matches.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // ✅ ユーザー情報取得（有効ユーザーのみ）
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, status');

    if (userError) throw new Error('ユーザー取得エラー: ' + userError.message);

    // ✅ クライアント情報取得
    const { data: clients, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('uid, region_prefecture, region_city, industry');

    if (clientError) throw new Error('クライアント取得エラー: ' + clientError.message);

    // ✅ 整形
    const results = matches
      .map((match) => {
        const user = users.find((u) => u.id === match.user_id && u.status === 'active');
        const client = clients.find((c) => c.uid === match.user_id);
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
  } catch (err) {
    console.error('❌ エラー:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
