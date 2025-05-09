# 📄 ChatClientSB ストリーム化実装 / 補助金構造化対応 【2025年5月版】

## ✅ 概要

本モジュールは、`chat-module-sb` における補助金支援チャット機能を「ストリーミング応答」「構造化データ活用」に対応させたバージョンです。  
補助金記事（jnet_articles_public）に基づき、ユーザーが具体的な質問を投げかけることで、構造化済みの補助金情報を活用してリアルタイムに回答することを目的としています。

---

## 🔁 実装ステップと経緯

### 1. ✅ チャットのストリーミング化（GPT応答）

- `useChatSB-t.ts`: 独自のチャットフックで `fetch + SSE` による応答処理を構築
- `ChatClientSB.tsx`: メッセージ表示をストリームで描画
- `api/chat-gpt-stream-t/route.ts`: OpenAI API を用いたストリーム返答を構成（GPT-4 → GPT-3.5 対応あり）
- `ChatInput.tsx`: シンプルなテキスト入力 + 送信 UI

### 2. ✅ 補助金構造化データの取得と注入

- `scrapingSupabaseClient` を通じて `jnet_articles_public` の構造化カラム群を取得
- hidden message として構造化情報を AI に注入（prompt bias）
- `structured_title`, `structured_purpose`, `structured_target_entities`, `structured_amount_max`, などを使用

### 3. ✅ UIとURL遷移のつなぎ込み

- `client-dashboard/news-control/NewsList.js` にて「💬申請サポート」ボタンを新設
  - `/chat-module-sb?aid=${article_id}&uid=${uid}` に遷移
- `ChatClientSB.tsx` 側で `searchParams` を用いて `articleId`/`uid` を取得 → session識別

---

## 🧩 技術ハイライト

| 機能 | 内容 |
|------|------|
| 💬 チャット応答 | GPT-3.5 / GPT-4 (OpenAI API, stream) |
| 🔎 構造化注入 | hidden system message に構造化プロンプト |
| 📦 Supabase連携 | `jnet_articles_public`, `chat_sessions`, `clients` |
| 🧠 コンテキスト整備 | 「制度案内の専門AI」＋構造化情報 |
| 🔧 トークン調整 | max_tokens: 200 に制限し冗長な返答を防止 |
| 🎛️ モデル指定 | `"gpt-3.5-turbo"` 明示で軽量化・高速化対応 |

---

## 📌 今後のタスク（ToDo）

- [ ] 🔐 個別ユーザー対応：chat_sessions の session 再開機能を強化
- [ ] 💬 会話ログ保存：stream処理中の全文記録
- [ ] 📊 structured_summary カラムの内容を定期更新（cron処理）
- [ ] 📦 GPTプロンプトのテンプレート化・制御精度向上
- [ ] ✍️ 「質問テンプレート表示」などのユーザー誘導強化

---

## 🏁 運用確認

- `npm run dev` → http://localhost:3000/chat-module-sb?aid={article_id}&uid={uid}
- エラー時は `supabase.log()` / `console.error()` にて詳細確認
- schema変更時は SQL定義を都度 README に追記すること

---

## 🔖 補足

構造化データの抽出は将来的に `scripts/modules/promptTemplates.js` 等の AI 自動化により補完予定。  
構造化された情報をベースに「制度の適合性を問う」会話を行う形式は、補助金支援業務において極めて有効なチャネルです。

---
★★

📝 ChatClientSB 実装概要（セッション管理付きAIチャット）
📌 概要
本システムは、以下の構成で成り立つシンプルかつ拡張性の高い AIチャットルームです。

ユーザーは特定の「記事ID・セッションID」ごとにチャットを実施

chat_sessions でセッション記録、chat_messages にメッセージを保存

AIからの応答も Supabase に保存し、再訪時に確認可能

過去のやり取りはモーダルで別表示し、現在の会話と分離

📁 構成ファイル
ファイル名	役割
ChatClientSB.tsx	メインチャット画面・送信・セッション処理
useChatSBT.ts	メッセージ送信とAIレスポンスの受信・処理
ChatInput.tsx	チャット入力欄コンポーネント
ChatHistoryModal.tsx	モーダル表示による過去ログ参照画面

🚀 フロー概要
ユーザーがページを開く（URLに aid, uid, sid, email を含む）

chat_sessions にセッションが存在するか確認（初回/継続判定）

ユーザーの入力を保存（chat_messages に role: "user"）

OpenAI にリクエスト → ストリーミング受信

完了時に role: "assistant" として保存

メッセージは message_index によって並び順を管理

「過去のやり取りを見る」ボタン → モーダルで履歴一覧表示

🛠 保存先テーブル構造（Supabase）
🔹 chat_sessions
カラム名	型	内容
id	uuid	セッションID（主キー）
article_id	text	記事ID
user_id	uuid	ユーザーID
created_at	timestamp	作成日時

🔹 chat_messages
カラム名	型	内容
id	uuid	メッセージID
session_id	uuid	紐づくセッション
user_id	uuid	発言者
content	text	メッセージ本文
role	text	user / assistant
message_index	int	並び順管理用
created_at	timestamp	作成日時

💡 Tips
保存は送信時・返信完了時の1回ずつのみ

過去のやり取り表示はモーダルで完全に分離

message_index はセッション内での会話順管理に使用

✅ 今後の拡張アイデア
セッション履歴一覧ページの追加（複数セッション対応）

ユーザーごとの履歴ダッシュボード

モーダルのカード表示・返信内容フィルタなどUI向上

