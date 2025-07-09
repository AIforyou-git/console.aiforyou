/**
 * 🌐 Phase 1 地域マッチング専用ロジック
 * - 都道府県単位で対象記事を抽出
 * - 全国対象記事も併せて取得
 * - 対象は scraping 用 Supabase プロジェクト
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import scrapingClient from '@/lib/supabaseScrapingClient'; // 🔁 スクレイピング用クライアントを追加

export async function getPrefectureMatches() {
  console.log('🔍 都道府県一覧の取得開始');

  const { data: rawPrefectures, error: prefError } = await supabaseAdmin
    .from('city_master')
    .select('prefecture_kanji') // ❌ distinct は使えない
    .neq('prefecture_kanji', '') // 空値を除外
    .order('prefecture_kanji', { ascending: true });

  if (prefError || !rawPrefectures) {
    console.error('❌ 都道府県の取得に失敗:', prefError?.message);
    throw new Error('都道府県の取得に失敗しました');
  }

  // ✅ 重複除外
  const seen = new Set();
  const prefectures = rawPrefectures.filter((p) => {
    if (seen.has(p.prefecture_kanji)) return false;
    seen.add(p.prefecture_kanji);
    return true;
  });

  console.log(`✅ 都道府県 ${prefectures.length} 件を取得`);

  const results = [];

  for (const pref of prefectures) {
    const prefecture = pref.prefecture_kanji;
    console.log(`📍 マッチ対象: ${prefecture}`);

    // ✅ 該当都道府県の補助金（公開済み）を取得
    const { data: articlesInPref, error: inPrefError } = await scrapingClient
      .from('jnet_articles_public')
      .select('article_id')
      .eq('visible', true)
      .eq('send_today', true)
      .not('published_at', 'is', null)
      .ilike('structured_prefecture', `%${prefecture}%`);

    if (inPrefError) {
      console.warn(`⚠️ ${prefecture} の都道府県マッチ取得エラー:`, inPrefError.message);
    }

    // ✅ 全国対象も取得
    const { data: articlesNationwide, error: nationwideError } = await scrapingClient
      .from('jnet_articles_public')
      .select('article_id')
      .eq('visible', true)
      .eq('send_today', true)
      .not('published_at', 'is', null)
      .ilike('structured_prefecture', '%全国%');

    if (nationwideError) {
      console.warn(`⚠️ 全国対象マッチ取得エラー:`, nationwideError.message);
    }

    results.push({
      prefecture,
      matched_in_pref: articlesInPref?.map((a) => a.article_id) || [],
      matched_nationwide: articlesNationwide?.map((a) => a.article_id) || [],
    });

    console.log(
      `✅ ${prefecture} → 県内: ${articlesInPref?.length || 0}件, 全国: ${articlesNationwide?.length || 0}件`
    );
  }

  console.log(`🎯 全マッチ結果 作成完了: ${results.length} 件`);
  return results;
}
