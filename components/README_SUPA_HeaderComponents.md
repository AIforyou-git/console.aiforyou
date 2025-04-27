（Supabase対応済みヘッダー群の説明）

md
コードをコピーする
# ✅ README：Supabase対応 ヘッダー群

## 🎯 対象ファイル

components/ ├── HeaderUser.js ├── HeaderAdmin.js ├── HeaderAgency.js ├── HeaderClient.js ├── HeaderPublic.js

markdown
コードをコピーする

## 🔧 主な対応内容

各ロール（user / admin / agency / client）ごとのナビゲーションヘッダーを Supabase対応に統一。

### ✅ Firebase → Supabase の差し替え
- Firebaseの `signOut(firebaseAuth)` を削除
- Supabaseの `useAuth().logout()` に統一
- セッション破棄処理は `router.replace("/login?logout=1")` で共通対応
- `HeaderClient` と `HeaderPublic` は元々 Firebase 非依存 → 変更なし

## 💡 効果と統一方針

| 項目 | 内容 |
|------|------|
| 保守性 | ログアウト処理を共通関数（useAuth）に集約 |
| セキュリティ | Supabase JWTセッションに統一され、middleware制御と連携しやすい |
| 拡張性 | ロールに応じたUI・動線制御の拡張が容易 |
| UI | 既存のヘッダーデザイン・ルーティング構造は維持し、影響なし |

## ✅ 完了済みファイル構成（Supabase準拠）

| ファイル名 | Firebase依存除去 | logout関数 | コメント |
|------------|------------------|-------------|----------|
| HeaderUser.js | ✅ 完全対応済 | useAuth().logout | Supabase統一 |
| HeaderAdmin.js | ✅ 完全対応済 | useAuth().logout | Supabase統一 |
| HeaderAgency.js | ✅ 完全対応済 | useAuth().logout | Supabase統一 |
| HeaderClient.js | ✅ 元から非依存 | useAuth().logout | 初期から Supabase構成 |
| HeaderPublic.js | ✅ 非依存 | - | UI表示のみのため変更不要 |

## 🔐 今後の対応検討

- middleware.ts による role-based redirect の統一
- logout 処理時の操作ログ（SQL：logout_logs）との連携
- RLS活用による画面アクセス制御の強化