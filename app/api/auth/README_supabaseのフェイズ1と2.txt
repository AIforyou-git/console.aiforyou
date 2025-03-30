
✅ フェーズ1 vs フェーズ2：Supabase 同期構成の進化
🔹 フェーズ1：サーバー側同期（登録時に即同期）
Firestore → Supabase 同期の流れが確立済み

UID をベースに Firestore からデータ取得（getDoc(doc(...))）

取得データを supabase.from("client_accounts").upsert() で登録・更新

Firestore Timestamp → Supabase timestamptz への変換：.toDate().toISOString()

API レスポンス形式：

成功時：{ success: true }

失敗時：{ error: "メッセージ" }

登録時の同期は /api/auth/register-user の最後にトリガーされる

🔹 フェーズ2：クライアント側同期（初回ログイン時に同期）
クライアントログイン後、/client-dashboard/page.js にて以下の処理を実行：

処理	説明
Firebase Auth 監視	onAuthStateChanged にてログイン状態と UID を検知
clients/{uid} 存在確認	無ければ profileCompleted: false で初期ドキュメント作成
profileCompleted が false の場合	モーダル（ClientInfoForm.js）を表示
モーダル入力完了後	onClose() で /api/auth/sync-client-to-supabase を呼び出し
Supabase 同期	今回から Supabase Edge Function（syncClient）を経由して書き込み
🔁 フェーズ1 → フェーズ2 の主な違い
項目	フェーズ1	フェーズ2
同期タイミング	登録直後（サーバー）	初回ログイン後（クライアント）
トリガー	/api/auth/register-user	/client-dashboard & ClientInfoForm.js
送信方式	Next.js API 経由（Node）	Edge Function 経由（Supabase サーバレス関数）
JWT 問題	Firebase Admin SDK により安全に認証	Edge Function にて Bearer Token 必須（JWT）
実行環境	Node.js ベース	Deno（Supabase Edge Runtime）
使用 SDK	@supabase/supabase-js	同上（ただし Edge 対応）
📡 最新同期フロー：クライアントから Supabase Edge へ
bash
コピーする
編集する
① 登録時
    /api/auth/register-user
        ↓
    Firestore users コレクション → 保存
        ↓
    Supabase（client_accounts）へ insert（フェーズ1）

② 初回ログイン
    /client-dashboard
        ↓
    clients/{uid} がなければ作成
        ↓
    モーダル（ClientInfoForm）表示
        ↓
    profileCompleted: true ＆ 各種項目入力
        ↓
    onClose() → /api/auth/sync-client-to-supabase
        ↓
    Supabase Edge Function（syncClient）へ POST（フェーズ2）
✅ ポイント

今後の設計では、Supabase Functions（Edge）を活用した非同期・セキュアな処理分離が標準化されていく見込み。

Firebase 認証情報（JWT）を安全に Edge Function へ渡す運用が今後の鍵となる。

この構成の変化により、セキュリティ・同期制御の明確化、モジュール分離による拡張性向上が実現されました。今後のフェーズ3（例えば「管理画面でのユーザー同期管理」）にも発展しやすい土台が整っています。