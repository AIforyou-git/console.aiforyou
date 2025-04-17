# 📁 /app/signup-client

## 📌 フォルダ概要
このフォルダは **クライアント（Client）用のサインアップページ**を提供します。  
紹介コード（`ref`）付きでアクセスしたユーザーが仮登録を行うための専用フォームです。

---

## 📂 フォルダ構成

| ファイル名 | 内容 |
|------------|------|
| `page.js` | エントリポイント。`SignupClientPageClient.js` を呼び出すだけの薄い構成 |
| `SignupClientPageClient.js` | 実際の登録UI・紹介コードチェック・登録処理の本体（Tailwind対応済） |
| `signup.css` | Tailwind 移行により **未使用**（削除予定） |
| `layout.js` | ヘッダーなしで表示するための構成（シンプル） |

---

## ✅ 実装の特徴

- ✅ **紹介コード必須**：`ref=CQ-CLIENT-xxxxxxx` のようなコードでアクセスすること
- ✅ 紹介コードは `/api/auth/check-referral` で有効性を確認
- ✅ 有効なコードのみ登録フォームが表示される
- ✅ `/api/auth/register-user` に仮登録リクエスト送信
- ✅ 仮パスワードは `/api/auth/send-email` を通じてメール送信
- ✅ 登録成功時は `/login` に自動リダイレクト

---

## 🛠 Tailwind 対応ステータス

- ✅ UIは Tailwind ユーティリティクラスのみで構築済み
- ✅ `signup.css` は未使用（削除可）

---

## 🔍 注意点

- `ref` パラメータなし、または無効なコードは自動的に `/error-page?msg=invalid_ref` にリダイレクトされます
- クライアント登録時は Firestore の `users`, `clients` 両方にデータが登録されます（API側にて）
- API側が `CQ-CLIENT-` を判定できるようになっている必要があります

---

## 🔄 将来的な統一構想（参考）

将来的には `/signup-unified?ref=...` のような共通フォームに集約される可能性があります。  
その際は `ref` のprefix（例: `CQ-CLIENT-`, `UQ-USER-`）によって自動的に登録処理が分岐する設計を想定しています。
