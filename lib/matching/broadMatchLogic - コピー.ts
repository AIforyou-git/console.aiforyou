import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getPrefectureMatches() {
  // ✅ 都道府県一覧を取得
  const { data: prefectures, error: prefError } = await supabaseAdmin
    .from('city_master')
    .select('prefecture_kanji')
    .neq('prefecture_kanji', '') // 空値を除外
    .order('prefecture_kanji', { ascending: true });

  if (prefError) {
    throw new Error('都道府県の取得に失敗しました');
  }

  const results = [];

  for (const pref of prefectures) {
    const prefecture = pref.prefecture_kanji;

    // ✅ 該当都道府県の補助金（公開済み）を取得
    const { data: articlesInPref } = await supabaseAdmin
      .from('jnet_articles_public')
      .select('article_id')
      .ilike('target_prefecture', `%${prefecture}%`);

    // ✅ 全国対象も取得
    const { data: articlesNationwide } = await supabaseAdmin
      .from('jnet_articles_public')
      .select('article_id')
      .ilike('target_prefecture', '%全国%');

    results.push({
      prefecture,
      matched_in_pref: articlesInPref?.map(a => a.article_id) || [],
      matched_nationwide: articlesNationwide?.map(a => a.article_id) || [],
    });
  }

  return results;
}
