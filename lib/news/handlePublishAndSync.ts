// lib/news/handlePublishAndSync.ts
import { publishArticle } from './publishArticle';
import { syncToUiCache } from './syncToUiCache';

export const handlePublishAndSync = async (article_id: number) => {
  const { error: publishError } = await publishArticle(article_id);
  if (publishError) return { success: false, step: 'publish', error: publishError };

  const { error: syncError } = await syncToUiCache(article_id);
  if (syncError) return { success: false, step: 'sync', error: syncError };

  return { success: true };
};
