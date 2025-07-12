🧠 UI側の主なロジック概要
1. 地域条件の適用
clientData.match_by_city に応じて、以下のように地域フィルタが切り替わります。

✅ 市区町村単位でのマッチ
sql
コピーする
編集する
structured_area_full = clientData.region_full
OR (structured_prefecture = clientData.region_prefecture AND structured_city IS NULL)
OR structured_prefecture = '全国'
✅ 都道府県単位でのマッチ
sql
コピーする
編集する
structured_prefecture IN (clientData.region_prefecture, '全国')
structured_area_full は「都道府県 + 市区町村」の完全一致文字列（例：東京都新宿区）

2. 業種条件の適用（mode: 'industry'）
js
コピーする
編集する
query = query.overlaps("structured_personal_category", [clientData.industry]);
structured_personal_category は text[] 型（PostgreSQLのArray）で、クライアントの関心業種と重なっている記事だけを抽出。

3. キーワード検索
sql
コピーする
編集する
OR 条件で複数カラムに対して ilike フィルタ：
- structured_title
- structured_summary_extract
- structured_agency
- structured_prefecture
4. お気に入りフィルタ
ts
コピーする
編集する
supabase.from("user_engagement_logs")
  .select("article_id")
  .eq("user_id", userId)
  .eq("action_type", "like")
  .eq("action_value", true)
対象記事だけを in フィルタで抽出。

5. 並び替え
公開日（published_at）などのカラムで order 処理。

🗂️ テーブル構造（必要カラム）
✅ jnet_articles_public
公開中の補助金・支援記事を格納。

カラム名	型	用途
article_id	uuid	主キー
structured_title	text	タイトル
structured_agency	text	支援機関
structured_prefecture	text	都道府県（例：東京都）
structured_city	text	市区町村（例：新宿区）
structured_area_full	text	地域完全文字列（例：東京都新宿区）
structured_summary_extract	text	要約
structured_amount_max	text	補助上限など
structured_application_period	json	期間情報（start/end）
structured_personal_category	text[]	タグ（業種フィルタに使用）
published_at	timestamptz	公開日時
detail_url	text	詳細リンク

✅ user_engagement_logs
ユーザーのお気に入り・非表示などの記録

カラム名	型	備考
user_id	uuid	Supabase認証ユーザーID
article_id	uuid	対象記事のID
action_type	text	like / ignore / etc
action_value	boolean	true or false
created_at	timestamptz	オプションで記録可能

✅ chat_sessions
申請サポート機能のセッション管理

カラム名	型	説明
id	uuid	セッションID（主キー）
user_id	uuid	ユーザーID
user_email	text	ユーザーEmail
article_id	uuid	関連記事
article_title_snippet	text	タイトルの一部
status	text	active / closed など

🧩 次のステップ：Admin側との条件統一のために確認すること
Admin側も地域条件が上記と一致しているか？

structured_area_full を扱っているか

structured_city IS NULL 条件があるか

Admin側に業種フィルタ（structured_personal_category）が存在しているか？

overlaps を利用しているかどうか

UIと同じ「全国含める」ルールを採用しているか？

全国 = "structured_prefecture = '全国'" というルールで共通化されているか

