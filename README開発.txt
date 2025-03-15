Next.jsによる
ブラウザのキャッシュをクリア (Ctrl + Shift + R)

npm run build (ビルド)

npm start


cd "C:\Users\nogaw\Desktop\dev_all\vercel\console.aiforyou"

dev環境　
npm run dev
http://localhost:3000
ポート指定
set PORT=3002 && npm run dev

本番環境
npm run build (ビルド)

npm start

http://localhost:3001

を開いて、 メールアドレス & パスワード でログインしてみる！

新規登録
http://localhost:3000/register

本番デプロイ
https://console.aiforyou.jp/

>>>>>>>>>>>>>>>>>>>>>>>>>>
3000（開発モード）と 3001（本番プレビュー）の更新の仕組み
環境	更新方法	手動 or 自動？	動作の違い
3000（開発モード）	ファイルを保存すれば即時反映	自動（ホットリロード）	Next.js がリアルタイムでコードを読み込む
3001（本番プレビュー）	npm run build で更新	手動（ビルドが必要）	Next.js が本番と同じ環境を作る

3000に戻す
netstat -ano | findstr :3000


# 開発サーバーを一度止める
CTRL + C

Next.js のキャッシュを削除する
rmdir /s /q .next

Next.js を再起動
npm run dev

テストログイン
info@aiforyou.jp
ai5963


\\\\\\\\\\\\\\
✅ 代理店は本部の紹介コード (任意のコード) を使うか代理店の紹介コードで登録可能
✅ 代理店は「ユーザー及びクライアント」を管理し、ユーザーは「クライアント」を管理する
✅ ユーザーは本部紹介コード及び、代理店の紹介コードから登録可能
✅ ユーザーには、後から代理店を割り当てることも可能（変更可という事）
✅ クライアントは本部紹介コード及び、代理店の紹介コード及び、ユーザーの紹介コードから登録可能
✅ 紹介コードの仕組みを活用し、代理店とユーザーとクライアントの関係をスムーズに紐づける

http://localhost:3000/

【master_admin】
admin@aiforyou.jp
costman2024

nogawamasaru@gmail.com
costman2024


rnMg2Yt2PkgFeCl10ufnuWhHc4s2

サインアップURL
本番
https://console.aiforyou.jp/signup?ref=HQ-AGENCY  ※本番URL
https://console.aiforyou.jp/signup?ref=HQ-USER  ※本番URL
https://console.aiforyou.jp/signup?ref=HQ-CLIENT  ※本番URL


ローカル
http://localhost:3000/signup?ref=HQ-AGENCY
http://localhost:3000/signup?ref=HQ-USER
http://localhost:3000/signup?ref=HQ-CLIENT


user＞クライアント紹介コード
http://localhost:3000/signup-user?ref=HQ-USER-l3Ii5mXaqrZoBVf25MU93eXUhXd2


サインアップページ
✅ 仮登録完了！パスワードを使ってログインしてください。

http://localhost:3000/
テストアカウント

＞admin
nogawamasaru@gmail.com
costman2024


＞AGENCY
tsd.nogawa@gmail.com
j2v7709h

＞USER

tsd.nogawa+user7@gmail.com 
jgo30lph

＞CLIENT
tsd.nogawa+user13@gmail.com
7t3hrvoj

tsd.nogawa+user5@gmail.com
nX2lKE^9WbB2

tsd.nogawa+user3@gmail.com
tsd.nogawa+user4@gmail.com
tsd.nogawa+user5@gmail.com
tsd.nogawa+user6@gmail.com
tsd.nogawa+user7@gmail.com
tsd.nogawa+user8@gmail.com
tsd.nogawa+user9@gmail.com
tsd.nogawa+user10@gmail.com
tsd.nogawa+user11@gmail.com
tsd.nogawa+user12@gmail.com
tsd.nogawa+user13@gmail.com
tsd.nogawa+user14@gmail.com
tsd.nogawa+user15@gmail.com
tsd.nogawa+user16@gmail.com
tsd.nogawa+user17@gmail.com
tsd.nogawa+user18@gmail.com
tsd.nogawa+user19@gmail.com
tsd.nogawa+user20@gmail.com
tsd.nogawa+user21@gmail.com
tsd.nogawa+user22＠gmail.com


メールサーバー
SMTP_HOST=e1.valueserver.jp
SMTP_PORT=465
SMTP_USER=info@mail.system.aiforyou.jp
SMTP_PASS=nnHrNCeCTQwq
\
※注
ログアウトの記録を残せないので一旦保留して次へ進みます。

★新規登録チェック
admin > admin管理画面から手動入力　＞コレクションにlastLogin、statusが存在しない　

http://localhost:3000/signup?ref=HQ-AGENCY　＞メールOK　ログインOK　×pending　、lastLogin

http://localhost:3000/signup?ref=HQ-USER　　＞メールOK　ログインOK　×lastLogin

http://localhost:3000/signup?ref=HQ-CLIENT　＞メールOK　ログインOK　×pending　、lastLogin


★ログインチェック
直打ち
http://localhost:3000/admin-dashboard　　＞リロードして保持OK　リダイレクトされない　ログアウトエラーあり
http://localhost:3000/user-dashboard　　＞リロードして保持NG　ログイン画面にリダイレクトされる
http://localhost:3000/agency-dashboard　＞リロードして保持OK　リダイレクトされない

http://localhost:3000/client-dashboard　＞リロードして保持OK　リダイレクトされない　ログアウトエラー　ログの挙動がおかしい


今日 • 12:07 午後　ルール最後

✅ 1行だけ無効化 → //
✅ 複数行をまとめて無効化 → /* ... */
.next ディレクトリを削除
rmdir /s /q .next

.next を初期化（キャッシュの削除）
rmdir /s /q node_modules\.cache


＝＝＝＝＝＝＝＝＝＝＝＝

import { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 🔥 ESLint のエラーを無視
  },
};

export default nextConfig;

＝＝＝＝＝＝＝＝＝＝＝＝＝＝
