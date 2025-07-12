// lib/matching/getPublishedTodayArticles.ts

export async function getPublishedTodayArticles() {
  const res = await fetch('/api/news-new/get-published-today-articles');

  if (!res.ok) {
    console.error('記事取得失敗:', res.status);
    return [];
  }

  const data = await res.json();
  return data;
}
