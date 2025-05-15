// hooks/useArticles_0.js

import { supabase } from "@/lib/supabaseClient";

export async function getFilterParamsForClient() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: client } = await supabase
    .from("clients")
    .select("region_prefecture, region_city, match_by_city")
    .eq("user_id", user.id)
    .single();

  if (!client) return null;

  const filters = {
    region_prefecture: client.region_prefecture,
    region_city: client.region_city,
    useCityMatch: client.match_by_city === true,
    prefectureList: [client.region_prefecture, "全国"]
  };

  return filters;
}
