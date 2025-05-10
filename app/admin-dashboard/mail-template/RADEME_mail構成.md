✅ ① テンプレート管理UI（admin用）
bash
コピーする
編集する
app/
└── admin-dashboard/
    └── mail-template/
        ├── page.js                   # テンプレート一覧画面
        ├── create/
        │   └── page.js               # 新規作成（Joditエディタ）
        └── edit/
            └── [id]/
                └── page.js           # 編集画面（テンプレ編集＋保存）
✅ ② 配信確認＆実行UI
perl
コピーする
編集する
app/
└── admin-dashboard/
    └── news-send/
        ├── page.js                   # 本日配信予定一覧（クライアント×記事）
        ├── preview/
        │   └── [client_id]/
        │       └── page.js           # 各クライアントへの実際の配信内容確認
        └── send/
            └── page.js               # 配信実行ボタン（手動配信 or バッチ処理）
✅ ③ APIルート
bash
コピーする
編集する
app/
└── api/
    └── mail-template/
        ├── create/route.js          # POST: 新規テンプレ保存
        ├── list/route.js            # GET: 一覧取得
        └── [id]/
            ├── get/route.js         # GET: 詳細取得
            ├── update/route.js      # PATCH: 更新
            └── delete/route.js      # DELETE: 削除

    └── news-send/
        ├── get-today-targets/route.js   # GET: 今日送る対象一覧
        ├── generate-html/route.js       # POST: メールHTML生成（テンプレ+カード）
        ├── send-to-client/route.js      # POST: 個別送信
        └── send-batch/route.js          # POST: 一括送信
✅ ④ 共通ライブラリ
bash
コピーする
編集する
lib/
├── renderTemplate.js              # プレースホルダ差込処理（{{$full_name}} 等）
├── generateCardHTML.js           # 記事データ → HTMLカード変換
├── sendMail.js                   # nodemailerまたはSendGrid送信処理
✅ ⑤ Supabase テーブル（最低限2つ）
email_templates

id, title, content, logo_url, created_by, created_at, updated_at

delivery_logs

id, client_id, article_id, sent_at, status（成功/失敗）

✅ 推奨作業順（初日）
mail-template/ UI（一覧＋create＋edit）

email_templates テーブル作成（Supabase UIでOK）

renderTemplate.js（変数置換処理）

generateCardHTML.js（仮のカードHTML）

sendMail.js（送信API）

news-send/page.js（当日対象一覧表示）

★★
⚠️ 修正・追加すべき点
① delivery_logs.client_id → user_id に明確化（usersテーブル主軸に）
READMEでは「client_id」と記載

実装と方針では user_id（auth.users.id）を使用

✅ READMEに client_id → user_id の修正が必要

② 構造化データの「可視化・配信フラグ管理」が明文化されていない
READMEには jnet_articles_public に関する次の構成が書かれていません：

visible: boolean（client表示許可）

send_today: boolean（本日配信許可）

admin_memo: text（内部メモ）

✅ これらをREADMEに追加することで、admin中心運用の展望と整合します。

✅ ⑥ 構造化記事の制御カラム（adminが管理）

jnet_articles_public テーブルに以下のカラムを追加：

- visible (boolean): クライアントに表示するかどうか
- send_today (boolean): 本日の配信対象として扱うか
- admin_memo (text): 管理用メモ（任意）

これにより、adminが構造化データを精査・公開制御・配信許可する運用が可能。
client-dashboard 側では visible=true のみを表示。

★★

📘 README｜メールテンプレート管理 & 自動配信構成（2025/05/10 完成）
✅ 概要
この機能は、管理者が構造化された助成金・補助金記事を元に、
条件にマッチするクライアントへ 一括メール配信 を行うための仕組みです。

📤 配信対象は自動でマッチング

✉ テンプレートは自由に作成・編集

📅 管理画面からワンクリックで配信可能

🗂 ログはDBに保存し、再送を防止

🗂️ 構築済みディレクトリ構成
bash
コピーする
編集する
app/
├─ admin-dashboard/
│  └─ mail-template/
│     ├─ page.js                # 一覧表示
│     ├─ create/page.js         # 新規作成フォーム
│     └─ edit/[id]/page.js      # 編集・削除ページ

├─ api/
│  └─ mail-template/
│     ├─ list/route.js          # 一覧取得
│     ├─ create/route.js        # 新規作成
│     └─ [id]/
│         ├─ get/route.js       # 個別取得
│         ├─ update/route.js    # 更新処理
│         └─ delete/route.js    # 削除処理

│  └─ news-send/
│     ├─ get-today-targets/route.js   # 本日マッチング取得
│     └─ send-today/route.js          # 配信実行（SMTP）
✅ 実装機能一覧
機能カテゴリ	実装内容
📩 テンプレート管理	一覧表示・新規作成・編集・削除
🧠 記事マッチング	クライアント属性（業種・地域）と記事内容の自動マッチ
📤 配信確認	本日対象のユーザーと記事を管理画面で確認
✉ メール送信	SMTP（Valueserver）経由で一括送信
🗃 ログ保存	delivery_logs に送信履歴を記録（再送防止）

✅ 使用テーブル
🔹 email_templates
カラム名	型	説明
id	int	テンプレID（PK）
title	text	タイトル
content	text	本文（HTML）
logo_url	text	ロゴ画像URL（任意）
created_at	timestamp	作成日時（自動）

🔹 delivery_logs
カラム名	型	説明
id	int	ログID（PK）
user_id	uuid	宛先ユーザーID
article_id	int	対象記事ID
sent_at	timestamp	配信日時

✅ 補足
テンプレートは 現在1種類を共通使用（将来的には切り替え可能に拡張可）

配信は 「本日送信フラグが立っており、かつ未送信の組み合わせ」のみ対象

編集画面では 削除ボタン付きで管理者操作が完結可能

Joditエディタ によりHTMLメールをGUIで構築

✅ 今後の拡張候補
機能	内容
🧪 テンプレートプレビュー	実際の本文を事前表示
⭐ デフォルトテンプレ指定	一覧で選択可能に
⏰ 自動cron送信対応	夜間バッチ配信など

🏁 完了日
2025年5月10日（土） 17:15 完了
（開発期間：約1日）


★★
📝 将来的な「公開日」制御対応メモ
✅ 現状
表示順は structured_at（構造化完了日時）で制御

visible フィルタは未使用（コメントアウト中）

「公開・非公開」操作は不要な状態で、すべての記事がそのまま表示される仕様

📌 今後対応する可能性がある内容
1. visible カラムの活用（記事の公開・非公開管理）
管理画面での切り替え操作で対応予定

現在 .eq("visible", true) のフィルタはコメントアウト

2. published_at カラムの導入（表示順に使う想定）
structured_at ではなく、公開操作した日時を基準にしたソートを実現する

公開操作時に published_at = now() を自動付与する設計

ts
コピーする
編集する
query = query
  .eq("visible", true)                  // 公開済み記事のみ
  .order("published_at", { ascending: false }); // 公開日の新しい順
3. 管理UIへの拡張
公開ボタン → visible = true, published_at = now()

非公開ボタン → visible = false, published_at = null

🧪 今はどうする？
すべての構造化済み記事が即表示対象

visible / published_at は考慮せずに一覧化


★★
[⚠ プロフィール変更後の注意]
クライアントの都道府県などの属性を編集・更新した後、遷移先で確実に反映された状態でマッチングを行うため、更新完了後のページ遷移時には router.replace() もしくは router.refresh() による強制的な再読み込みを行うこと。

【理由】
更新が反映される前に次ページへ遷移すると、古いデータ状態でマッチングが行われ、全件表示・フィルタ未適用の不具合が生じるため。