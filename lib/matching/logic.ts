import { createClient } from '@supabase/supabase-js';

import adminClient from '@/lib/supabaseAdmin'; // 保存用
import { supabase as usersClient } from '@/lib/supabaseClient'; // 名前付きエクスポートから取得
import scrapingClient from '@/lib/supabaseScrapingClient'; // ← スクレイピング用プロジェクト

type Client = {
  uid: string;
  industry: string;
  region_prefecture: string;
  region_full: string;
};

type Article = {
  article_id: number;
  structured_personal_category: string[];
  structured_prefecture: string;
  structured_city: string;
  structured_area_full: string;
};

export type RegionMatchResult = {
  client: Client;
  article: Article;
  matched_region: string;
};

export type CategoryMatchResult = RegionMatchResult;

export async function runRegionMatch(): Promise<RegionMatchResult[]> {
  console.log('▶️ runRegionMatch 実行開始');

  const { data: clients, error: clientError } = await usersClient
    .from('clients')
    .select('uid, industry, region_prefecture, region_full');

  if (clientError || !clients) {
    console.error('❌ clients 取得エラー:', clientError);
    throw clientError;
  }
  console.log('👥 clients 取得:', clients.length, '件');

  const { data: articles, error: articleError } = await scrapingClient
    .from('jnet_articles_public')
    .select('article_id, structured_personal_category, structured_prefecture, structured_city, structured_area_full');

  if (articleError || !articles) {
    console.error('❌ articles 取得エラー:', articleError);
    throw articleError;
  }

  const result: RegionMatchResult[] = [];

  for (const client of clients) {
    const clientPref = String(client.region_prefecture).trim();
    const clientFullRegion = String(client.region_full).trim();

    for (const article of articles) {
      const articlePref = String(article.structured_prefecture).trim();
      const articleCity = String(article.structured_city).trim();
      const articleAreaFull = String(article.structured_area_full).trim();

      if (articleAreaFull === clientFullRegion) {
        // 地域完全一致（都道府県＋市区町村）
        result.push({ client, article, matched_region: '地域完全一致' });
      } else if (!articleCity && articlePref === clientPref) {
        // 市区町村の指定がなく、都道府県レベルで一致
        result.push({ client, article, matched_region: '都道府県一致（県内）' });
      } else if (articlePref === '全国') {
        // 全国対象記事
        result.push({ client, article, matched_region: '全国対象' });
      }
    }
  }

  console.log('✅ マッチ完了:', result.length, '件');
  return result;
}

export function runCategoryFilter(matches: RegionMatchResult[]): CategoryMatchResult[] {
  return matches.filter((match) => {
    const client = match.client;
    const article = match.article;
    return Array.isArray(article.structured_personal_category) &&
           article.structured_personal_category.includes(client.industry);
  });
}

export function groupMatchesByUser(matches: CategoryMatchResult[]) {
  const grouped: { [user_id: string]: number[] } = {};
  matches.forEach((match) => {
    const user_id = match.client.uid;
    if (!grouped[user_id]) {
      grouped[user_id] = [];
    }
    grouped[user_id].push(match.article.article_id);
  });
  return Object.entries(grouped).map(([user_id, matched_articles]) => ({
    user_id,
    matched_articles,
  }));
}
// 修正内容：重複エクスポートの削除
// 削除前：
// 理由：各関数はすでに個別に export 済みのため、重複 export によるエラーを回避
//export { runRegionMatch, runCategoryFilter, groupMatchesByUser };
