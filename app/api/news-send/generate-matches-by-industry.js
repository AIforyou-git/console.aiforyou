// /pages/api/news-send/generate-matches-by-industry.js
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { industry } = req.body;
  if (!industry) {
    return res.status(400).json({ error: "Missing required 'industry' in body." });
  }

  try {
    // クライアント取得（業種でフィルタ）
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from("clients")
      .select("id, user_id, industry")
      .eq("industry", industry);

    if (clientsError) throw clientsError;
    if (!clients || clients.length === 0) {
      return res.status(200).json({ message: "No clients found for this industry." });
    }

    const targetDate = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();
    const results = [];

    for (const client of clients) {
      // 記事取得（業種が一致するもの）
      const { data: articles, error: articlesError } = await supabaseAdmin
        .from("jnet_articles_public")
        .select("id")
        .contains("industries", [client.industry]); // industries: string[] の想定

      if (articlesError) throw articlesError;

      const matchedArticleIds = articles.map((a) => a.id);
      if (matchedArticleIds.length === 0) continue;

      // マッチ結果を upsert
      const { error: upsertError } = await supabaseAdmin
        .from("client_daily_matches")
        .upsert({
          user_id: client.user_id,
          target_date: targetDate,
          matched_articles: matchedArticleIds,
          calculated_at: now,
          source: "admin:industry",
        }, { onConflict: "user_id,target_date" });

      if (upsertError) throw upsertError;

      results.push({
        user_id: client.user_id,
        matched_articles_count: matchedArticleIds.length,
      });
    }

    return res.status(200).json({
      message: "Matching by industry completed.",
      industry,
      matched_clients: results.length,
      details: results,
    });

  } catch (error) {
    console.error("[generate-matches-by-industry] Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
