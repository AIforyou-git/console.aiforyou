# 📁 /app/login

## 📌 フォルダ概要
このフォルダは **ログイン処理のUI・ロジック**を担当します。
Firebase Authentication を使ったメールアドレスによるログイン画面を提供します。

---

## 📂 構成ファイル

| ファイル名 | 内容 |
|------------|------|
| `page.js`（または `page-t.js`） | ログインフォーム本体。Tailwindベースで構成 |
| `recover/`（任意） | パスワードリセット用ページなど（未整備） |

---

## ✅ 実装の特徴

- Tailwind CSS に完全対応
- Firebase `signInWithEmailAndPassword()` を使用
- エラー表示（メール未登録・パスワード誤りなど）あり
- ログイン後は Firestore のユーザー情報からロールを判定し、自動でダッシュボードへリダイレクト

---

## 📎 その他補足

- `globals.css` により Tailwind が有効化されています
- ユーザーがログインしていない状態で `/login` にアクセスするのが前提
- 今後 `recover` や `loginLogs` 連携など拡張予定あり
