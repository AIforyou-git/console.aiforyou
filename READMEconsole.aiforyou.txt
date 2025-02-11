Next.jsによる
ブラウザのキャッシュをクリア (Ctrl + Shift + R)

npm run build (ビルド)

npm start


cd "C:\Users\nogaw\Desktop\console.aiforyou"

dev環境　
npm run dev
http://localhost:3000


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