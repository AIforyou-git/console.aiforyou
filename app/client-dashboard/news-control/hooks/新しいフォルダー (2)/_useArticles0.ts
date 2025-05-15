import { useMemo } from "react";

export function useArticles0(clientData?: {
  match_by_city?: boolean;
  region_prefecture?: string;
  region_city?: string;
}) {
  const regionFilter = useMemo(() => {
    if (!clientData?.region_prefecture) return null;

    // 市区町村まで絞る場合（厳密配信）
    if (clientData.match_by_city && clientData.region_city?.trim()) {
      return {
        mode: "strict_city",
        prefectures: [clientData.region_prefecture, "全国"],
        city: clientData.region_city,
      };
    }

    // 都道府県単位のみ
    return {
      mode: "prefecture_only",
      prefectures: [clientData.region_prefecture, "全国"],
    };
  }, [clientData]);

  return { regionFilter };
}
