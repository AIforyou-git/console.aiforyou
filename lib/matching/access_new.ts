import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * マッチ結果を client_news_new_matches に保存（1ユーザー1日1レコード）
 */
export async function saveMatchesToNewsNewTable(
  matchResults: {
    user_id: string;
    matched_articles: any[];
    source?: string;
  }[]
) {
  // ✅ JST基準の today を使用
  const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const today = jstNow.toISOString().slice(0, 10);
  const now = new Date().toISOString();

  console.log('📥 [news-new] 保存対象件数:', matchResults.length);
  if (matchResults.length > 0) {
    console.log('🧾 [news-new] 最初の保存対象:', matchResults[0]);
  } else {
    console.warn('⚠️ [news-new] 保存対象が空です');
    return;
  }

  await Promise.all(
    matchResults.map(async (match) => {
      const { user_id, matched_articles, source = 'news-new' } = match;

      if (!user_id || typeof user_id !== 'string') {
        console.warn('⚠️ 無効な user_id。保存をスキップ:', match);
        return;
      }

      if (!Array.isArray(matched_articles) || matched_articles.length === 0) {
        console.info(`ℹ️ matched_articles が無効 or 空: user_id=${user_id}`);
        return;
      }

      const { error: deleteError } = await supabase
        .from('client_news_new_matches')
        .delete()
        .match({ user_id, target_date: today });

      if (deleteError) {
        console.error(`❌ 削除エラー user_id: ${user_id}`, deleteError.message);
        return;
      }

      const { error: insertError } = await supabase.from('client_news_new_matches').insert({
        user_id,
        target_date: today,
        matched_articles,
        source,
        calculated_at: now,
      });

      if (insertError) {
        console.error(`❌ 保存エラー user_id: ${user_id}`, insertError.message);
      } else {
        console.log(`✅ 保存成功 user_id: ${user_id}, 件数: ${matched_articles.length}`);
      }
    })
  );
}
