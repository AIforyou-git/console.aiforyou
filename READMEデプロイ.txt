🚀 本番環境の環境変数チェック & デプロイ手順まとめ
👤 1人開発でも本番を安全に運用するために、環境変数の管理とデプロイ時のチェックをしっかりやる！
これを押さえれば、デプロイ後に「環境変数ミスった！」と焦らずに済む💪

📌 1. 本番環境の環境変数の管理
✅ 環境ごとに .env を分ける

環境	ファイル名
ローカル開発	.env.local
本番環境	.env.production
📌 /.env.local（ローカル開発用）

env
コピーする
編集する
API_BASE_URL=http://localhost:3000
📌 /.env.production（本番用）

env
コピーする
編集する
API_BASE_URL=https://api.aiforyou.jp
✅ .env を Git に含めない！
📌 .gitignore に追加

gitignore
コピーする
編集する
.env*
!env.example
📌 2. デプロイ前にローカルで環境変数をチェック
📌 ローカルで .env.production を適用し、事前に動作確認

bash
コピーする
編集する
cp .env.production .env.local
NODE_ENV=production npm run build && npm start
→ 本番と同じ条件でテストできる！

📌 3. デプロイ前に本番環境の環境変数を確認
🔹 Vercel の場合

bash
コピーする
編集する
vercel env pull
🔹 Firebase Functions の場合

bash
コピーする
編集する
firebase functions:config:get
🔹 Docker / AWS / Heroku の場合

bash
コピーする
編集する
printenv | grep API_BASE_URL
→ 本番の環境変数が間違っていないか事前にチェック！

📌 4. 本番デプロイ後の確認
📌 本番環境の環境変数が正しく読み込まれているか確認
🔹 Next.js (Vercel / Firebase Hosting) の場合

js
コピーする
編集する
console.log("API_BASE_URL:", process.env.API_BASE_URL);
🔹 Firebase Functions の場合

bash
コピーする
編集する
firebase functions:log
→ エラーが出てたら環境変数ミスの可能性大！

📌 5. 環境変数を間違えたときの対応策
✅ Vercel / Firebase なら環境変数だけ更新できる（デプロイ不要）
✅ Git で前のバージョンに戻せるようにしておく（ロールバック用）
✅ 最悪、本番デプロイし直す手順を決めておく

🚀 まとめ
✅ 環境ごとに .env を分ける (.env.local / .env.production)
✅ デプロイ前に .env.production でローカルテスト
✅ vercel env pull や firebase functions:config:get で本番環境変数を事前チェック
✅ デプロイ後に console.log や firebase functions:log で確認
✅ ミスったときの対応策を決めておく！

これをやれば、本番デプロイも怖くない！💪🔥
「環境変数ミスった！」でパニックにならないために、この手順を身につけよう！ 🚀