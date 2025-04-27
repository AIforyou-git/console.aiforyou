🧩 Supabase Edge Function 導入・デプロイ手順まとめ
✅ 前提：環境構成
Supabase プロジェクトが作成済み（例：xtepytepaojyrjtlyccf）

Supabase の clients テーブルが存在し、必要なカラムが作成済み

Supabase RLS（Row Level Security）を ON

Firebase + Firestore を既に使用している構成

🛠️ 1. Supabase CLI 環境の準備
bash
コピーする
編集する
npm install -g supabase
🔐 ログイン
bash
コピーする
編集する
npx supabase login
ブラウザが開く → Supabase アカウントでログイン

You are now logged in. と表示されればOK

🏗️ 2. Edge Function プロジェクト構成
Supabase プロジェクト直下に以下の構成を作成：

bash
コピーする
編集する
/supabase/functions/syncClient/index.ts
✍️ index.ts の中身（同期処理のロジック）
Firestore から取得したクライアント情報を Supabase clients テーブルに upsert します。
※このファイルは事前に準備済みのコードを利用。

🚀 3. Edge Function のデプロイ
プロジェクトルートで以下のコマンドを実行：

bash
コピーする
編集する
npx supabase functions deploy syncClient --project-ref xtepytepaojyrjtlyccf
✅ 成功メッセージ例：
nginx
コピーする
編集する
Deployed Functions on project xtepytepaojyrjtlyccf: syncClient
You can inspect your deployment in the Dashboard:
https://supabase.com/dashboard/project/xtepytepaojyrjtlyccf/functions
🌐 4. 呼び出しエンドポイントの確認
arduino
コピーする
編集する
https://xtepytepaojyrjtlyccf.functions.supabase.co/syncClient
この URL に対して POST でデータを送信します。

🔐 5. 認証トークンの設定（.env.local）
RLS が有効な場合は、Service Role トークンで認証が必要です。

env
コピーする
編集する
SUPABASE_FUNCTION_URL=https://xtepytepaojyrjtlyccf.functions.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sk_xxxxxxxxxxxxx（← Supabase > Settings > API より）
.env.local は .gitignore に追加しておくこと！

🧪 6. Postman でのテスト（任意）
ヘッダー設定
Key	Value
Content-Type	application/json
Authorization	Bearer SUPABASE_SERVICE_ROLE_KEY
ボディ例：
json
コピーする
編集する
{
  "uid": "test-uid-001",
  "email": "example@example.com",
  "name": "テストユーザー",
  "regionPrefecture": "東京都",
  "industry": "製造業",
  "profileCompleted": true,
  "createdAt": "2025-03-30T12:00:00.000Z"
}
🔁 7. Next.js 側から Edge Function を呼び出す
app/api/auth/sync-client-to-supabase/route.js にて以下のように呼び出し：

js
コピーする
編集する
const response = await fetch(`${process.env.SUPABASE_FUNCTION_URL}/syncClient`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify(clientData),
});
✅ 成功時のログ出力例（ローカル）
bash
コピーする
編集する
✅ Supabase Edge Function 経由 同期成功: UID
POST /api/auth/sync-client-to-supabase 200 in 1240ms
📦 補足：Docker 環境の注意
Supabase CLI は Edge Function デプロイ時に Docker を使用

Docker Desktop をインストールしておくこと（Windows/Mac）

📌 今後の展望
Edge Function にログ記録やバリデーションの追加

cron 機能や管理画面からの再同期ボタンなどの展開も容易

Supabase Functions ベースで webhook 対応なども可能