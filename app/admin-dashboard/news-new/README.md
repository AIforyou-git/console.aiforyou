🧠 Admin側マッチングの流れ（概要）
主なエントリーポイント
/api/news-new/generate-matches → runNewClientMatch() 実行 → 結果を client_news_new_matches に保存

🔄 マッチングロジック詳細：runNewClientMatch()
使用テーブル
clients: クライアントの設定（都道府県、市区町村、業種、マッチ条件）

jnet_articles_public: 記事マスタ（検索対象）

client_news_new_matches: マッチ結果の保存先（1日1レコード/ユーザー）

🎯 クエリロジック（地域＋業種）
1. 地域条件
ts
コピーする
編集する
if (match_by_city && region_full) {
  articleQuery = articleQuery.or(
    `structured_area_full.eq.${region_full},and(structured_prefecture.eq.${region_prefecture},structured_city.is.null),structured_prefecture.eq.全国`
  );
} else {
  articleQuery = articleQuery.in('structured_prefecture', [region_prefecture, '全国']);
}
match_by_city === true

完全一致: structured_area_full === region_full

都道府県単位: structured_prefecture === region_prefecture ＋ structured_city IS NULL

全国: structured_prefecture === '全国'

match_by_city === false

都道府県のみ（+ 全国）を対象にする

2. 業種条件
ts
コピーする
編集する
.overlaps('structured_personal_category', [industry])
PostgreSQLの text[] 型に対して、業種が含まれているかをチェック

💾 保存処理：saveMatchesToNewsNewTable()
保存テーブル: client_news_new_matches
対象ユーザーの当日分をいったん削除してから上書き

user_id, target_date, matched_articles, source, calculated_at

ts
コピーする
編集する
await supabase.from('client_news_new_matches').insert({
  user_id,
  target_date: today,
  matched_articles,
  source,
  calculated_at: now,
});
📨 配信処理：send-today
使用カラム
jnet_articles_public.send_today = true

visible = true

都道府県と業種をそれぞれ ilike で部分一致

ts
コピーする
編集する
.ilike('structured_industry_keywords', `%${industry}%`)
.ilike('structured_prefecture', `%${region}%`)
⚠️ 注意：ここでは structured_personal_category ではなく structured_industry_keywords を使っており、UI・マッチングロジックとは少しずれがあります。

🧱 Admin側の関連テーブル構成
✅ clients
カラム名	用途
uid	ユーザーID（user_id）
region_prefecture	対象都道府県
region_city	市区町村名（オプション）
region_full	完全地域名
match_by_city	true/false
industry	業種

✅ jnet_articles_public（検索対象記事）
カラム名	用途
structured_area_full	「都道府県+市区町村」の完全一致用
structured_prefecture	都道府県
structured_city	市区町村
structured_personal_category	text[] 型、業種分類
structured_industry_keywords	配信側のみ使用（text, ilike 対象）
send_today, visible	配信判定用

✅ client_news_new_matches
カラム名	用途
user_id	対象ユーザーID
target_date	マッチ対象日（1日1レコード）
matched_articles	配列形式で article_id を保持
calculated_at	計算日時
source	呼び出し元（例：news-new）

✅ 結論（Admin側の要点）
地域・業種ともに UI と同じロジックで抽出している（runNewClientMatch は一致）

マッチ結果は client_news_new_matches に保存、可視化・再送信が可能

一部処理（send-today）は UI とは異なるフィールド（structured_industry_keywords）を参照しており、ここは整合性確認・修正の候補