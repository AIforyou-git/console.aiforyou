✅ プロジェクト間連携のための設計テンプレート
以下を常に1枚で見られるようにしておくと、開発・運用どちらでも迷いが減ります。

📄 連携設計ドキュメント：構成と責任の整理表
項目	内容	備考
プロジェクトA（例：スクレイピング）	project_scrape	記事取得、カテゴリ付きで保存
プロジェクトB（例：ユーザー管理）	project_core	ユーザー・クライアント・業種を管理
共通識別子	industry	双方で完全一致するマスターを定義
マッチング責任者	project_core	「クライアントにマッチした記事」はここで決める
データの流れ	Scraped Articles → CoreへAPIで連携	PullでもPushでも可
保存先（最終マッチ結果）	client_daily_matches (B側)	日時単位で確定保存
非同期通信方法	REST API / Supabase RPC / CSV同期	環境に合わせて記述
接続エラー対策	タイムアウト／リトライ処理あり	明文化すると安心
確認方法	スプレッドシート or PostgRESTビュー	バックオフィス向けに可視化

🧠 指示を書くときのコツ：5つの「誰が／いつ／何を／どこへ／なぜ」
質問	設計文の例
誰が？	project_scrape が記事一覧を取得
いつ？	毎朝 6:00 に最新データを取得し、前日分を送信
何を？	structured_personal_category を industry マスターに準拠して送る
どこへ？	project_core/api/import-articles へ POST（形式は JSON）
なぜ？	クライアント別記事推薦（matching）処理の正確性を担保するため

🛠 フォーマットテンプレート（Markdown推奨）
md
コピーする
編集する
## 🔗 プロジェクト間連携仕様書

### ✅ 対象プロジェクト
- project_scrape：記事情報を定期取得
- project_core：ユーザー・マッチングを担う

### ✅ データ構造マスター
- 共通キー：industry（厳密一致）
- 記事側：structured_personal_category → [text[]]
- ユーザー側：clients.industry → text

### ✅ 処理フロー
1. scrape側で記事取得
2. core側にカテゴリ付きで送信（API or スプレッドシート）
3. core側で matching ロジックを実行し、client_daily_matches に保存

### ✅ 期待する結果
- clientごとの matched_articles[] を保存
- 日時・sourceを記録

### ✅ 補足
- フィールド不一致時のエラーはログに残す
- industryマスターは `/shared/industry-list.json` を両者で共通参照
✅ あなた向け補足：指示は「何を期待するか」に集中する
プログラマに指示を出すときは「こういうコードを書いて」より
「どういう出力がほしいか」「どこからどこまでの責任範囲か」を示すことが本質です。

✅ まとめ
「プロジェクト間連携は人間関係と同じ。境界と約束をはっきりさせること」が最重要

常に以下を1ページに収めておく：責任・流れ・形式・参照マスター

曖昧なところはスプレッドシートかMarkdownで先に見える形にしておく


★★
GASによるプロトタイプ作成
📌 実行ステップ（毎日または必要時）
① 地域マッチングを実行
javascript
コピーする
編集する
matchByRegion()
対象：clients シートと jnet_articles_public シート

条件：

structured_city がある → structured_area_full と region_full を比較

structured_city が空欄 → structured_prefecture と region_prefecture を比較

または structured_prefecture === "全国" の記事

出力：地域マッチ結果 シート（列：uid, article_id, matched_region）

② 地域マッチ済み記事を業種でフィルター
javascript
コピーする
編集する
filterByCategoryFromRegion()
対象：地域マッチ結果 でマッチした記事の article_id に限定

各クライアントの industry が記事の structured_personal_category に含まれるかを判定

出力：業種フィルター済み結果 シート（列：uid, article_id, matched_industry）

③ 本日公開された記事をフラグ付け（必要に応じて）
javascript
コピーする
編集する
updateSendTodayFlag()
jnet_articles_public 内の published_at を基に

本日公開のものは send_today = TRUE、それ以外は FALSE

通知処理で利用可能

🔄 自動化（任意）
matchByRegion() と filterByCategoryFromRegion() を 日次トリガーで自動実行設定可能

updateSendTodayFlag() も同様に定期実行推奨

🧩 その他メモ
すべての処理対象データは Google Sheets 上で管理

必要に応じて uid 単位のオンデマンド処理を将来的に追加可能

通知やUI表示では、send_today == TRUE のみを対象とすることで「新着」の抽出が可能

以上が現在の実行フローに基づく README です。必要に応じて GitHub用・Markdown形式にも変換可能です。希望があればお知らせください。