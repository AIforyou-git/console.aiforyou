✅ 構成概要と導線の関係性
🔐 page.js：ログイン画面（/login）
supabase.auth.signInWithPassword() によるログイン処理。

成功後にログインユーザーを識別 → users テーブルから role, status, email, plan を取得。

ユーザーが "client" の場合：

プラン	リダイレクト先
"premium" or "trial"	/client-dashboard（利用開始済）
その他	/client-dashboard/client-dashboard_checkin（案内導線へ）

🟢 page.tsx：/client-dashboard/client-dashboard_checkin 画面
useAuth() によってログインユーザー情報を取得。

Supabaseから以下2点を確認：

clients.profile_completed → 未完ならモーダル表示（フォーム）

users.plan → "premium" なら /client-dashboard へ即遷移、それ以外はトライアル案内を表示。

✅ フローまとめ
plaintext
コピーする
編集する
[Login Page (/login)]
      ↓ ログイン成功
[plan = premium/trial] ────────────▶ [client-dashboard]
[plan = free/undefined]             ▶ [client-dashboard_checkin]
                                              ↓
                                     [clients.profile_completed チェック]
                                     → 未完了なら ClientInfoForm モーダル表示
                                     → 完了 & plan ≠ premium → 「トライアルを開始」ボタン
✅ Stripe導線への接続点
page.tsx では以下のトライアル導線がキーになります：

ts
コピーする
編集する
const handleStartTrial = (): void => {
  router.push("/stripe_v3/plans"); // ✅ Stripeプラン選択画面へ遷移
};
つまり：

client-dashboard_checkin 画面で「トライアルを開始」ボタン押下

stripe_v3/plans に遷移し、Stripe Checkoutを開始する想定

✅ 確認できた状態まとめ
項目	状況
ユーザーロール判定	✅ users.role による分岐処理あり
プラン判定処理	✅ users.plan により「トライアル案内 or ダッシュボード」へ分岐
Stripe導線開始トリガー	✅ router.push("/stripe_v3/plans") で発火
profile_completedチェック	✅ モーダルでフォーム入力を促す設計あり

