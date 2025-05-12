✅ クライアントUX向上に向けた「行動データ構成」と実装計画まとめ
🎯 目的（再確認）
クライアントが補助金情報を見たときに：

どの記事に「興味を示した」のか（👍お気に入り）

どの記事を「不要だと判断した」のか（🚫スルー）

これらの情報を蓄積・可視化・制御に活かすこと

➡ 最終的には「最適な情報配信とUIのパーソナライズ」を実現する。

📐 構成方針
1. 評価データは UI/UX ログとして横断的に管理
テーブル名：user_engagement_logs（仮）

対象：全クライアント操作ログ（お気に入り、不要、クリック等）

他の機能（チャット・配信）とは切り離しつつも紐付け可能

2. 既存構成との連携（接続関係）
python
コピーする
編集する
users.id      ←┐
clients.uid   ←┤ user_id として記録
jnet_articles_public.article_id ────→ article_id
記事ID × クライアントIDの評価ログを柔軟に蓄積
将来的に BI/可視化用 View で集計・分析が可能

3. user_engagement_logs テーブル案（シンプル汎用型）
カラム名	型	説明
id	uuid	主キー
user_id	uuid	クライアントID
article_id	int	評価対象の記事ID
action_type	text	"like", "ignore", "click" など
action_value	boolean	評価（true/false）
created_at	timestamptz	評価日時

➡ "like": true や "ignore": true のように、柔軟かつ明確な評価管理が可能

🧭 今後の実装計画
フェーズ	内容	状態	担当
✅ Step 1	構成方針・命名ルール確定	完了	-
🔜 Step 2	user_engagement_logs テーブルを Supabase に作成	未了	あなた
🔜 Step 3	NewsList.js に UI ボタン（👍🚫）追加	UI済	GPT（page-t提供可能）
🔜 Step 4	ボタンクリック → upsert 保存	未了	GPT提供予定
🔜 Step 5	表示制御（ignore = true は非表示）	後回し	-
🔮 Step 6	配信フィルターや「おすすめ」判定に応用	拡張	-

🔁 今後の拡張可能性（UX指向の成長戦略）
項目	内容
💡 滞在時間	長く見た記事を自動「興味あり」扱いに
🧭 絞り込み傾向	よく使う検索キーワードもログ化
📤 通知自動最適化	「like」された業種・市区だけを通知対象に
📊 分析UI	管理者が「誰が何に関心を持っているか」分析可能に

✅ 次のアクション確認
 Supabase に user_engagement_logs テーブルを作成（上記定義でOK？）

 page-t 形式で「評価保存処理付き NewsList.js」作成 → GPTが担当


 📌 README：クライアントダッシュボード 記事一覧画面 改修まとめ

✅ 対象ファイル
/app/client-dashboard/NewsList.js

✅ 目的
ユーザーが記事に対して「お気に入り」「不要」などのリアクションを記録・活用できるようにし、UXを向上させる。また、検索オプションの表示・非表示を切り替え可能にし、UIの煩雑さを軽減。

✅ 実装内容
① Firestoreログ保存 → PostgreSQLに統一
user_engagement_logs テーブルに以下を記録

user_id

article_id

action_type（like / ignore）

action_value（true固定）

② 「お気に入り」「この情報は不要」ボタンの追加
tsx
コピーする
編集する
<button onClick={() => handleEngagement(article.article_id, "like")}>👍 お気に入り</button>
<button onClick={() => handleEngagement(article.article_id, "ignore")}>🚫 この情報は不要</button>
「お気に入り」された記事には ★マークを表示

「不要」な記事は一覧から非表示

③ 非表示記事一覧ページ /client-dashboard/hidden/page-t.js
非表示記事だけを一覧表示（user_engagement_logs の action_type = 'ignore'）

表示復元ボタンにより復活可能（レコード削除）

④ 検索オプションの表示/非表示切り替え機能
tsx
コピーする
編集する
const [showSearchOptions, setShowSearchOptions] = useState(false); // 🔽 初期状態は非表示
トグルボタンで検索UIを切り替え可能

UI内の 検索オプションを表示/隠す で制御

✅ 今後の拡張ポイント
💡 like フィルターによるお気に入り記事抽出

💡 ページング/ソート条件をURLパラメータに反映

💡 管理者が全ユーザーのログを分析可能な管理画面の追加

★★

📘 NewsList.js 開発進捗まとめ（～2025/05/12）
✅ 検索オプションの初期状態変更
検索オプションを隠す をデフォルト状態に変更

js
コピーする
編集する
const [showSearchOptions, setShowSearchOptions] = useState(false);
✅ トースト通知を導入（ポップアップから変更）
useToast を利用した保存結果通知に変更

保存失敗・成功を toast() で通知

js
コピーする
編集する
import { useToast } from "@/components/ui/use-toast";
const { toast } = useToast();
✅ おすすめキーワードに「お気に入り」を追加
keywordOptions に "お気に入り" を追加

js
コピーする
編集する
const keywordOptions = ["補助金", "災害", "設備投資", "人材育成", "お気に入り"];
✅ お気に入り絞り込み対応
keyword === "お気に入り" のとき、user_engagement_logs から like=true の記事IDを取得し in() で絞り込み

js
コピーする
編集する
const { data: likes } = await supabase
  .from("user_engagement_logs")
  .select("article_id")
  .eq("user_id", userId)
  .eq("action_type", "like")
  .eq("action_value", true);
✅ Supabase検索時のキーワード安全化
キーワードを encodeURIComponent でエスケープ

js
コピーする
編集する
const safeKeyword = encodeURIComponent(keyword.trim());
✅ 検索ヒット数の表示
記事の件数表示を <h1> の右上に追加

js
コピーする
編集する
<div className="text-sm text-green-600">{articles.length} 件の結果</div>
✅ 検索語のクリアによる BadRequest 対策
keyword.trim() を .length === 0 の場合は .or() を呼び出さないよう制御

✅ 「この情報は不要」即時反映
記事カードの ignore 評価登録後、即 setEngaged() に反映して非表示に

js
コピーする
編集する
setEngaged((prev) => ({
  ...prev,
  [articleId]: { ...prev[articleId], ignore: true }
}));
🏷️ 表示タイトルの見直し（提案中）


✅ 当初の改善リスト達成状況
改善内容	状況	補足
✅ 「この情報は不要」で非表示化 & 即反映	✅ 完了	setEngaged() で即時UI更新済み
✅ 非表示リストの復活（復元ページ）	✅ 完了	/client-dashboard/hidden にページ構築済み
✅ お気に入りマーク（★）表示	✅ 完了	engaged[articleId]?.like 判定で表示済み
✅ 「お気に入り」の一覧フィルター	✅ 完了	キーワード "お気に入り" で切り替え可能に
✅ トースト通知の統一	✅ 完了	useToast() を用いて表示方法を統一
✅ 検索オプションを初期状態で非表示	✅ 完了	showSearchOptions を false に設定済み
✅ 検索ヒット数の表示	✅ 完了	件数を一覧の上部に表示済み
✅ 入力欄クリア時の挙動	✅ 完了	.trim() が空の時は .or() を避ける設計済み
🔄 表示タイトルの改善	⚠️ 検討中	「配信候補記事一覧」→クライアント文脈に応じて調整予定

🔧 補足機能として追加されたもの
機能	状況
🔹 セッション付きチャット遷移処理	✅ 完了（エラー時の対応含む）
🔹 地域自動取得と記事マッチング	✅ 完了（region_prefecture による絞り込み）
🔹 UI要素の表示/非表示切替（折りたたみ）	✅ 完了（検索オプションなど）

