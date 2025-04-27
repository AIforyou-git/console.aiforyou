📘 AIforyou チャット構造化・成長型提案システム 構成README
🎯 概要
本システムは、ユーザーとのチャット履歴を通じて得られた情報を構造化・蓄積し、次回以降の回答精度を向上させる成長型チャット × 提案型情報配信エンジンの構築を目的とする。

ユーザーの疑問・要望 → 元データと紐づけて構造化

構造化された情報を次回チャットに活用

興味傾向に応じて、最適な補助金・制度情報を「提案」形式で自動配信可能にする

🧱 基本構成
🔹 1. チャット関連テーブル

テーブル名	役割
chat_sessions	チャット単位（ユーザーと記事の組み合わせ）
chat_messages	メッセージ単体（role: user / assistant）
chat_feedback	特定の質問と元記事の関連付け・フィードバック
🔹 2. 構造化・推薦関連テーブル

テーブル名	役割
structured_articles	GPTやユーザー会話をもとに構造化された補助金記事情報
user_insights	ユーザーの関心傾向・タグ・行動ログから算出される推薦用スコア
💬 チャット履歴の流れ
ユーザーがチャットを開始（session生成）

chat_messages にメッセージとAI応答を保存

GPTが裏で「関連するarticle_id」や「構造化タグ候補」を返す（or管理者確認）

chat_feedback 経由で structured_articles に構造化情報が追加されていく

🧠 推薦フロー
user_insights で関心度や興味タグを蓄積

structured_articles のタグと突き合わせてレコメンドスコア生成

/api/recommendations にてユーザーに合う補助金情報を返すAPIを提供可能

🧪 スモールスタート案

ステップ	実装内容
Step1	chat_sessions, chat_messages テーブルを作成し、チャットUIから保存
Step2	chat_feedback テーブルで article_id との関連付けを試行
Step3	structured_articles の構造定義を設計（目的、地域、対象など）
Step4	管理者UIで構造化内容を編集 or GPTで提案
Step5	user_insights を定期生成 or 質問ベースでスコアリング開始
Step6	レコメンドAPI + ダッシュボードに実装
📦 使用技術
UI：Next.js + TailwindCSS

データベース：Supabase (PostgreSQL)

チャット保存：API + Supabase chat_messages

GPT連携：OpenAI API（構造化・分類）

Realtime：Supabase Realtime or polling

Firebase：除外予定（履歴・構造化管理は全てSQL側へ移行）

🔮 目指す世界
単なるQAではなく、**「ユーザーごとに最適な情報を先回りして提案」**するAIアシスタント

クライアントの質問を「資産」として蓄積・活用するナレッジフロー

構造化データが育つほど精度が高まり、AIが成長する仕組み


📝 Chat Module SB 構成変更記録（構築支援ログ）
📌 概要
この作業では、Supabaseベースのチャットモジュールにおいて、セッション識別・履歴取得・初期表示のUX改善・補助金情報の動的タイトル表示の実装を中心に対応しました。

✅ 主な実装・修正ポイント
1. チャットセッションの初回識別と管理
uid（ユーザーID）と articleId（記事ID）をクエリから取得

セッション存在有無を Supabase chat_sessions テーブルから判定

初回は isFirstSession を true にして初回用メッセージ演出表示

2. 履歴の表示ロジックを ChatHistoryList.tsx に集約
uid + articleId に基づくセッションを取得

対応する session_id を元に chat_messages を取得

履歴の日時表示や isFirstSession 演出メッセージも管理

3. 初回時のみAIの固定メッセージを演出
isFirstSession が true の時だけ ChatHistoryList 冒頭にメッセージ表示

ts
コピーする
編集する
「こんにちは！補助金に関するご相談ですね...」
4. タイトル表示の動的化 (structured_title)
Supabase jnet_articles_public から structured_title を取得

articleTitle state にセットし、表示に使用

tsx
コピーする
編集する
「豊頃町ゼロカーボンシティ推進加速化事業補助金」についてお答えします
5. 構成のセンシティブ化対応
既存構造・命名・責務分離を尊重した最小改修

useChatSB.ts など他ロジックと干渉しないように設計

表示ロジック（JSX）ではすべて articleTitle で統一

🗂 修正ファイル一覧

ファイル名	内容
ChatClientSB.tsx	uid/aidの受取・セッションチェック・構成演出・タイトル取得
ChatHistoryList.tsx	Supabaseから履歴取得・日付グループ化・初回演出メッセージ
.env.local	NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SCRAPING_SUPABASE_URL などが必要
🎉 完成状態スクリーンショット
✅ 「〇〇補助金についてお答えします」が正しく表示

✅ チャット初回演出、履歴表示、セッション登録の全てが正常動作

🔄 今後の展開に向けて（Next Step）
RLS（Row Level Security）対応

管理者によるセッション監視と対応フラグ追加

チャットタグや補助金カテゴリによる履歴フィルタリング

