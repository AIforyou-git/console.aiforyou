import { NextResponse } from 'next/server';

import { runRegionMatch, runCategoryFilter } from '@/lib/matching/logic';
import { saveMatchesToDailyTable } from '@/lib/matching/access';

export async function POST() {
  try {
    console.log('🟡 マッチング処理 開始');

    const regionMatches = await runRegionMatch();
    console.log('✅ 地域マッチ完了:', regionMatches.length);

    const finalMatches = runCategoryFilter(regionMatches);
    console.log('✅ 業種マッチ完了:', finalMatches.length);

    const grouped = groupMatchesByUser(finalMatches);
    console.log('📦 ユーザー単位で整形:', grouped.length);

    await saveMatchesToDailyTable(grouped);
    console.log('💾 Supabase 保存完了');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ マッチ生成エラー:', err);
    return NextResponse.json({ error: 'match failed' }, { status: 500 });
  }
}

// ✅ 修正済み：client.uid / article.article_id でアクセス
function groupMatchesByUser(matches) {
  const grouped = {};
  for (const match of matches) {
    const user_id = match.client.uid;
    const article_id = match.article.article_id;

    if (!grouped[user_id]) {
      grouped[user_id] = [];
    }
    grouped[user_id].push(article_id);
  }

  return Object.entries(grouped).map(([user_id, matched_articles]) => ({
    user_id,
    matched_articles,
  }));
}
