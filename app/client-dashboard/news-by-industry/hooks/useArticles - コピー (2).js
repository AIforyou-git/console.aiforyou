import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import scrapingClient from "@/lib/supabaseScrapingClient";

export function isArticleMatch(article, clientData) {
  if (!article || !clientData) return false;

  if (clientData.match_by_city) {
    return (
      article.structured_area_full === clientData.region_full ||
      (article.structured_prefecture === clientData.region_prefecture &&
        article.structured_city == null) ||
      article.structured_prefecture === "全国"
    );
  } else {
    return (
      article.structured_prefecture === clientData.region_prefecture ||
      article.structured_prefecture === "全国"
    );
  }
}

//export function useArticles({ page, keyword, sortBy, ascending, clientData }) {
  export function useArticles({ page, keyword, sortBy, ascending, clientData, mode }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [engaged, setEngaged] = useState({});
  const perPage = 20;

  useEffect(() => {
    const fetchEngagement = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from("user_engagement_logs")
        .select("article_id, action_type")
        .eq("user_id", user.id);

      if (!error && data) {
        const map = {};
        data.forEach(({ article_id, action_type }) => {
          if (!map[article_id]) map[article_id] = {};
          map[article_id][action_type] = true;
        });
        setEngaged(map);
      }
    };

    fetchEngagement();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const from = page * perPage;
      const to = from + perPage - 1;

      let query = scrapingClient
        .from("jnet_articles_public")
        .select(
          `
          article_id,
          structured_title,
          structured_agency,
          structured_prefecture,
          structured_application_period,
          structured_summary_extract,
          structured_amount_max,
          detail_url,
          published_at
        `,
          { count: "exact" }
        );

       if (clientData?.match_by_city && clientData?.region_full && clientData?.region_prefecture) {
        // 市区町村（structured_area_full）、都道府県全域（structured_city is null）、全国を対象に明示的にフィルタ
        query = query.or(
          `structured_area_full.eq.${clientData.region_full},and(structured_prefecture.eq.${clientData.region_prefecture},structured_city.is.null),structured_prefecture.eq.全国`
        );
      } else if (clientData?.region_prefecture) {
  // 都道府県単位（都道府県 + 全国）
  query = query.in("structured_prefecture", [clientData.region_prefecture, "全国"]);
}

if (mode === "industry" && clientData?.industry) {
 query = query.overlaps("structured_personal_category", [clientData.industry]);
 }
      if (keyword === "お気に入り") {
        const { data: likes } = await supabase
          .from("user_engagement_logs")
          .select("article_id")
          .eq("user_id", userId)
          .eq("action_type", "like")
          .eq("action_value", true);

        const likedIds = likes?.map((l) => l.article_id) || [];
        query = query.in("article_id", likedIds.length ? likedIds : [-1]);
      } else if (keyword) {
        const safeKeyword = keyword.trim();
        query = query.or(
          `structured_title.ilike.%${safeKeyword}%,structured_summary_extract.ilike.%${safeKeyword}%,structured_agency.ilike.%${safeKeyword}%,structured_prefecture.ilike.%${safeKeyword}%`
        );
      }

      query = query.order(sortBy, { ascending });
      const { data, count, error } = await query.range(from, to);
      if (!error) {
        setArticles(data || []);
        setTotalCount(count || 0);
      }
      setLoading(false);
    };

    fetchArticles();
  }, [page, keyword, sortBy, ascending, clientData]);

  return { articles, loading, engaged, userId, totalCount };
}
