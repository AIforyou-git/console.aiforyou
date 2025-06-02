"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authProvider";

export const useArticlesWithIndustry = ({
  page = 0,
  keyword = "",
  sortBy = "published_at",
  ascending = false,
  clientData = {},
}) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [engaged, setEngaged] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchArticles = async () => {
      if (!user) return;

      setLoading(true);
      let query = supabase
        .from("articles")
        .select("*", { count: "exact" })
        .range(page * pageSize, page * pageSize + pageSize - 1)
        .order(sortBy, { ascending });

      // 🔍 地域と業種によるフィルター
      if (clientData?.region_prefecture) {
        query = query.eq("structured_prefecture", clientData.region_prefecture);
      }
      if (clientData?.industry) {
        query = query.eq("industry", clientData.industry);
      }

      // 🔍 キーワード検索（部分一致）
      if (keyword) {
        query = query.ilike("title", `%${keyword}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("❌ 記事取得エラー:", error);
      } else {
        setArticles(data);
        setTotalCount(count || 0);
        fetchEngagements(data.map((a) => a.article_id));
      }

      setLoading(false);
    };

    const fetchEngagements = async (articleIds) => {
      if (!user || articleIds.length === 0) return;

      const { data, error } = await supabase
        .from("user_engagement_logs")
        .select("*")
        .eq("user_id", user.id)
        .in("article_id", articleIds);

      if (!error && data) {
        const grouped = {};
        data.forEach((log) => {
          if (!grouped[log.article_id]) grouped[log.article_id] = {};
          grouped[log.article_id][log.action_type] = log.action_value;
        });
        setEngaged(grouped);
      }
    };

    fetchArticles();
  }, [page, keyword, sortBy, ascending, clientData, user]);

  return {
    articles,
    loading,
    engaged,
    userId: user?.id,
    totalCount,
  };
};
