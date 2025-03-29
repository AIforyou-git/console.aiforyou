✅ 第1フェーズから学ぶ設計パターンのポイント
Firestore → Supabase 同期の流れが確立済み

UIDをベースにFirestoreからデータ取得（getDoc(doc(...))）

取得データを supabase.from("client_accounts").upsert() で登録・更新

必須型整合：toDate().toISOString() にて timestamptz 対応

APIレスポンス設計が明瞭

成功時 { success: true }

エラー時 { error: "メッセージ" }

APIトリガーは非同期発火もOK

fetch("/api/xxx", { method: "POST", body }) にて後続処理可能


>>>>>

構成解析まとめ：フェーズ2（モーダル→Firestore→Supabase同期）
① /client-dashboard/page.js の構成と動作
🔹 ログイン後の流れ：
処理	説明
Firebase Auth の状態監視	onAuthStateChanged にてログイン判定と uid 取得
clients/{uid} を確認	無ければ初期ドキュメント作成（profileCompleted: false）
profileCompleted が false ならモーダル表示	✅ クライアント初回起動時の導線が確保されている
users/{uid} のステータス更新	pending → active に変更し、lastLogin 更新
モーダル終了後 → API /api/sync-client-to-supabase 呼び出し	Supabase との同期トリガー。状態管理も OK


② ClientInfoForm.js の構成と動作
🔹 入力項目と保存先
フィールド名（フォーム）	Firestore 保存先
name	clients/{uid} の name
regionPrefecture	同上
industry	同上
その他	profileCompleted: true を updateDoc で更新
🔹 実装ポイント
ユーザーの uid は getAuth().currentUser.uid で取得

フォームバリデーション (isFormValid)

保存後 onClose() をコール → page.js 側で handleModalClose() が呼ばれ、同期へ進行

\\\\
全体フローのつながり（1〜2フェーズ連動）
pgsql
コピーする
編集する
① 登録時
    register-user → send-email → sync-client-to-supabase/route.js
        ↓
② クライアント初ログイン
    client-dashboard.page.js
        ↓
③ Firestore clients に初期情報作成
        ↓
④ モーダル入力（ClientInfoForm.js）
        ↓
⑤ Firestore clients に詳細更新 ＆ profileCompleted = true
        ↓
⑥ onClose → /api/sync-client-to-supabase にて Supabase へ client_accounts 同期（第2フェーズ完了）


