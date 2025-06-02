✅ システム全体構成概要
🎯 目的：
「ユーザー（クライアント）に対して、その日のマッチング記事を自動・手動で選定・送信する仕組み」を提供する管理者向けダッシュボード。

🗂 ファイル別役割整理
1. page.js（/admin-dashboard/news-send）
管理UIを提供：

「本日のマッチングを生成」ボタン → /api/news-send/generate-matches を呼び出し

「マッチング取得」ボタン → /api/news-send/get-today-targets を呼び出し

「本日配信を実行」ボタン → /api/news-send/send-today を呼び出し

結果の表示機能あり

2. generate-matches（マッチング生成API）
本日の日付で clients × jnet_articles_public を条件で照合

一致した article_id[] を client_daily_matches に upsert

一件もマッチしなければスキップ

3. get-articles-by-ids（記事情報取得）
記事ID一覧を受け取り、記事詳細（タイトル・機関名）を一括取得

4. get-today-targets（対象者の一覧取得）
client_daily_matches をもとに、対象ユーザーの詳細情報を統合

users、clients テーブルと JOIN 的に組み合わせて整形返却

5. send-today（実際の配信）
全 users に対して、クライアントの属性と記事を条件に再照合

重複送信防止（delivery_logs をチェック）

sendMailToUser を通じてメール送信

結果を user + status 形式で返却

🧱 データ構造：client_daily_matches テーブル
カラム名	型	説明
id	uuid	主キー、gen_random_uuid()
user_id	uuid	対象クライアントのユーザーID
target_date	date	対象日、デフォルトは CURRENT_DATE
matched_articles	jsonb	マッチした記事ID配列（例: ["id1", "id2"]）
calculated_at	timestamptz	マッチ計算時刻
source	text	"client" or "admin" など、呼び出し元識別に使用

🔁 全体フロー（図式的に）
sql
コピーする
編集する
[管理者UI (page.js)]
       │
       ├─▶ generate-matches（POST）
       │     └─ client_daily_matches に当日分を upsert
       │
       ├─▶ get-today-targets（GET）
       │     └─ client_daily_matches + users + clients を JOIN 的に取得
       │
       ├─▶ get-articles-by-ids（POST）
       │     └─ 該当記事IDの詳細を一括取得
       │
       └─▶ send-today（POST）
             ├─ users + clients で該当記事を抽出
             ├─ delivery_logs で送信履歴を除外
             └─ sendMailToUser により送信処理
