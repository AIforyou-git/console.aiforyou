import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  const { article } = await req.json();

  // ✅ 必須チェックから structured_personal_category を外す
  if (!article?.article_id || !article?.structured_prefecture) {
    return NextResponse.json({ error: '記事データが不完全です' }, { status: 400 });
  }

  try {
    const { data: clients, error: clientErr } = await supabaseAdmin
      .from('clients')
      .select('uid, region_prefecture, industry, auto_mail_enabled, cc_email_1, cc_email_2');

    if (clientErr) throw new Error(clientErr.message);

    const categories = Array.isArray(article.structured_personal_category)
      ? article.structured_personal_category
      : [];

    const matches = [];

    for (const client of clients) {
      if (!client.auto_mail_enabled) continue;
      if (!client.cc_email_1 && !client.cc_email_2) continue;

      const industryMatch = categories.length === 0 || categories.includes(client.industry);
      const regionMatch =
        article.structured_prefecture === client.region_prefecture || article.structured_prefecture === '全国';

      if (industryMatch && regionMatch) {
        matches.push({
          user_id: client.uid,
          email_1: client.cc_email_1,
          email_2: client.cc_email_2,
          industry: client.industry,
          prefecture: client.region_prefecture,
        });
      }
    }

    return NextResponse.json(matches);
  } catch (err) {
    console.error('マッチングエラー:', err.message);
    return NextResponse.json({ error: 'マッチング処理に失敗しました' }, { status: 500 });
  }
}
