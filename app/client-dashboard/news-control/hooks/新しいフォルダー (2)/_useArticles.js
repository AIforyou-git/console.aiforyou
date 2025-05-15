// regionFilter を受け取ってフィルタ適用
if (regionFilter?.mode === "strict_city" && regionFilter.city) {
  query = query
    .eq("structured_city", regionFilter.city)
    .in("structured_prefecture", regionFilter.prefectures);
} else if (regionFilter?.mode === "prefecture_only") {
  query = query.in("structured_prefecture", regionFilter.prefectures);
}
