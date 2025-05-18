// lib/news/publishArticle.ts

import scrapingClient from '@/lib/supabaseScrapingClient'; // ✅ OK

export const publishArticle = async (article_id: number) => {
  return await scrapingClient
    .from('jnet_articles_public')
    .update({
      visible: true,
      send_today: true,
      published_at: new Date().toISOString()
    })
    .eq('article_id', article_id);
};
