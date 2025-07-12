// lib/api/getMatchingUsersForArticle.ts

type Article = {
  article_id: string;
  structured_title?: string;
  structured_agency?: string;
  structured_region_prefecture?: string;
  structured_personal_category?: string[];
  // 必要に応じて追加
};

export async function getMatchingUsersForArticle(article: Article): Promise<any[]> {
  const res = await fetch('/api/news-new/get-matching-users-for-article', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ article }),
  });

  if (!res.ok) {
    console.error('マッチング取得失敗:', res.status);
    return [];
  }

  const data = await res.json();
  return data;
}
