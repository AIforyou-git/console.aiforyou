// lib/news/syncToUiCache.ts

import scrapingClient from '@/lib/supabaseScrapingClient';

export const syncToUiCache = async (article_id: number) => {
  return await scrapingClient.rpc('sync_article_to_ui_cache', {
    target_id: article_id
  });
};
