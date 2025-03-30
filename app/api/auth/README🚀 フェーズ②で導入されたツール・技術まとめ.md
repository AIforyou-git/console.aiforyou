🚀 フェーズ②で導入されたツール・技術まとめ
✅ 新たに導入されたツール・技術と用途
ツール / 技術名	用途・目的	導入理由 / メリット
Supabase Edge Functions	Supabase 上で動作するサーバレス関数（syncClient）	- セキュアに RLS 環境でもデータ同期を可能にする
- Firebase ⇔ Supabase 同期を API 経由で切り離せる
Postman	HTTP リクエストの手動テストツール	- API の動作確認をフロントエンド抜きでテスト可能
- JWT エラーやレスポンスの確認が容易
Bearer Token（サービスロールキー）	Edge Function に認証付きでリクエストを送るための Authorization ヘッダー	- RLS 有効時でも認証付きで書き込みが可能
- アクセス制御を明示的にできる
.env.local に環境変数を追加	SUPABASE_SERVICE_ROLE_KEY, SUPABASE_FUNCTION_URL など	- 機密情報をコードに直書きせず安全に管理
- 本番・開発環境で切り替えやすい
Deno ランタイム（Edge）	Supabase Edge Functions の実行環境	- 軽量で高速な関数実行が可能
- Node.js とは別の Deno 最適化環境
fetch 経由で Edge Function 呼び出し	Next.js の route.js から Supabase Function を叩く	- Firestore から取得したデータを柔軟に Supabase に同期可能
- SDK 不要で構造がシンプル
ログベースの同期ステータス管理	成功・失敗ログをコンソール出力	- デバッグしやすく、同期結果を確認できる（今後DB化も可能）
🆚 フェーズ① → フェーズ②：技術進化の比較
項目	フェーズ①（登録時同期）	フェーズ②（ログイン後同期）
同期トリガー	/api/auth/register-user の最後で実行	/client-dashboard でモーダル完了時に実行
同期方法	APIルートから直接 Supabase に upsert	Supabase Edge Function（syncClient）へ POST
セキュリティ	Firebase Admin SDK 経由（ローカル処理）	JWT（service_role）による RLS 対応済みの認証型
開発/検証性	フロントエンドからの挙動確認が中心	Postman でAPI単体検証が可能
拡張性	アプリ側に同期処理が内在していた	Edge Function に切り出され再利用性・保守性向上
📦 .env.local に追加した環境変数例
env
コピーする
編集する
SUPABASE_FUNCTION_URL=https://xxxxx.functions.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sk_xxxxx（← Supabase Studio > Settings > API より取得）
⚠️ GitHub などに公開しないよう .gitignore 対象にしておくこと！

✅ 成果・今後の運用指針
RLS（Row Level Security）を ON にしたまま、クライアント情報の同期が可能

Firebase Firestore ⇨ Supabase の双方向同期のフレームワークが完成

認証付き Supabase Edge Function の標準化により、将来的なデータ処理・自動化に対応可能

ログイン後の「モーダル情報収集」フェーズと同期処理を分離し、UX も保てる構成へ進化