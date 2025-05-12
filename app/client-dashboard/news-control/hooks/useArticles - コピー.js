// client-dashboard/news-control/hooks/useArticles.js

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import scrapingClient from "@/lib/supabaseScrapingClient";

export function useArticles({ page, keyword, sortBy, ascending, clientData }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState("");
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
        .select(`
          article_id,
          structured_title,
          structured_agency,
          structured_prefecture,
          structured_application_period,
          structured_summary_extract,
          structured_amount_max,
          detail_url
        `);

      // ✅ 地域フィルター
      if (clientData?.region_prefecture) {
        query = query.in("structured_prefecture", [clientData.region_prefecture, "全国"]);
      }

      // ✅ 業種キーワードを structured_title や summary に適用
      if (clientData?.industry) {
        const safeIndustry = encodeURIComponent(clientData.industry.trim());
        query = query.or(
          `structured_title.ilike.*${safeIndustry}*,structured_summary_extract.ilike.*${safeIndustry}*`
        );
      }

      // ✅ UI上のキーワードフィルター
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
        const safeKeyword = encodeURIComponent(keyword.trim());
        query = query.or(
          `structured_title.ilike.*${safeKeyword}*,structured_summary_extract.ilike.*${safeKeyword}*`
        );
      }

      query = query.order(sortBy, { ascending });
      const { data, error } = await query.range(from, to);
      if (!error) setArticles(data || []);
      setLoading(false);
    };

    fetchArticles();
  }, [page, keyword, sortBy, ascending, clientData]);

  return { articles, loading, engaged, userId };
}