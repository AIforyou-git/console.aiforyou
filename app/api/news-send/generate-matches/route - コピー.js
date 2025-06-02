import { NextResponse } from 'next/server';

//import { runRegionMatch } from '@/lib/matching/logic'; // ✅ 不要な runCategoryFilter を削除
import { runRegionMatch, runCategoryFilter } from '@/lib/matching/logic'; // ✅ runCategoryFilter を明示的にインポート
import { saveMatchesToDailyTable } from '@/lib/matching/access';

export async function POST() {
  try {
    console.log('🟡 マッチング処理 開始');

    const regionMatches = await runRegionMatch();
    console.log('✅ 地域マッチ完了:', regionMatches.length);

    const finalMatches = await runCategoryFilter(regionMatches);
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

function groupMatchesByUser(matches) {
  const grouped = {};
  for (const { user_id, article_id } of matches) {
    if (!grouped[user_id]) grouped[user_id] = [];
    grouped[user_id].push(article_id);
  }
  return Object.entries(grouped).map(([user_id, matched_articles]) => ({
    user_id,
    matched_articles,
  }));
}
