（クライアント情報編集モーダル）

md
コードをコピーする
# ✅ README：ClientEditModal.js（Supabase対応）

## 📄 対象ファイル

components/ └── ClientEditModal.js

csharp
コードをコピーする

## 🎯 目的
登録済みクライアントの詳細情報を編集・保存するためのモーダルフォームです。

## 🔧 Supabase対応内容

### ✅ Firestore依存の削除
- `updateClient`（FirestoreService） → `updateClientSB`（SupabaseService）へ差し替え

### ✅ UI構成は非変更
- フォーム入力、モーダル構造、ボタン構成などは完全に維持
- Supabaseへの更新処理のみ内部的に変更

## 📂 必要な補完ファイル

```js
// services/supabaseService.js
export async function updateClientSB(uid, data) {
  const { error } = await supabase
    .from("clients")
    .update({ ...data, updated_at: new Date() })
    .eq("uid", uid);

  if (error) throw error;
}
✅ モーダル内で対応している項目
UIフォーム	Supabaseカラム名	テーブル
名前	name	clients
会社	company	clients
業種	industry	clients
役職	position	clients
都道府県	region_prefecture	clients
市区町村	region_city	clients
メールアドレス表示	email (読み取り用)	users
メモ	memo	clients
🔐 セキュリティ設計前提
uid に対して RLS（auth.uid() = uid）を設定すること

他ユーザーの情報を更新できないよう Supabase 側で制御する

🔎 テスト方法
/client-dashboard/customers ページで「編集」ボタンからモーダルを開く

フォームを編集 → 「保存」

成功メッセージ表示（✅ 顧客情報が更新されました！）

Supabase Studio にてデータ反映を確認