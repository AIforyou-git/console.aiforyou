以下は new_matches 機能に関する README.md のドラフトです。プロジェクト内の /app/admin-dashboard/news-new/new_matches/README.md などに配置することを想定しています。

markdown
コピーする
編集する
# 🧠 new_matches - 本日公開記事のマッチング確認ダッシュボード

## 🔍 概要

この機能は「本日公開された記事（補助金等）」と「登録クライアント」の自動マッチング結果を表示し、  
**手動でメール送信ができる** UI を提供する管理者向けダッシュボードです。

- 対象記事には `visible: true`、`send_today: true`、`published_at` が本日 という条件が必要です。
- 各記事に対して、地域・業種に基づいてマッチするクライアントを一覧表示します。
- 管理者は送信先メールアドレスを選択し、手動でメールを送ることができます。

---

## 🗂️ 関連ファイル構成

app/
├── admin-dashboard/
│ └── news-new/
│ └── new_matches/
│ └── page.js ← UI コンポーネント（一覧＋送信ボタン）
app/
├── api/
│ └── news-new/
│ ├── get-published-today-articles/
│ │ └── route.js ← 本日公開記事一覧を取得する API
│ └── get-matching-users-for-article/
│ └── route.js ← 1記事ごとのマッチングユーザーを返す API
lib/
└── matching/
├── getPublishedTodayArticles.ts ← 記事取得用クライアント関数
└── getMatchingUsersForArticle.ts ← ユーザー取得用クライアント関数

markdown
コピーする
編集する

---

## 🎯 挙動と目的

### ✅ 記事取得
- Supabase テーブル `jnet_articles_public` から本日公開のものを取得
- 条件：
  - `visible = true`
  - `send_today = true`
  - `published_at` が今日

### ✅ マッチングロジック
- Supabase テーブル `clients` に対して
- 以下を満たすクライアントを抽出：
  - `auto_mail_enabled = true`
  - `cc_email_1` または `cc_email_2` が存在
  - `structured_prefecture` が一致、または `全国` 記事
  - `structured_personal_category` にクライアントの業種が含まれる  
    （⚠ 空欄の場合は「すべての業種と一致」として処理）

### ✅ UI 表示
- 各記事ごとに：
  - `No`（連番）
  - `article_id`
  - `structured_title`
  - `structured_agency`
  - クライアント件数
  - 各クライアントのメールアドレス（チェックボックス付き）

### ✅ 送信
- 管理者がチェックしたメールアドレスに対して個別送信可能
- `/api/news-new/send-individual-mails` に `POST` で送信（別途実装）

---

## 🔔 備考・今後の課題

- `structured_personal_category` が空の場合 → 全業種として扱っている（今後検討）
- マッチング結果に業種未設定があれば UI 上で赤字警告表示
- パフォーマンス改善のため、マッチングは1記事ずつ並列取得
- エラーはコンソール・画面下部に表示される

---

## ✅ スクリーンショット（例）

No.12 ｜ ID: 159753
「環境対応型補助金」
募集機関: 環境省
マッチしたクライアント数: 2
☑ email1@example.com（東京都 / 製造業）
☐ email2@example.com（神奈川県 / サービス業）

yaml
コピーする
編集する
