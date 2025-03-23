 Vercel でのメール送信トラブルシューティングの経緯 & 解決まとめ
✅ 1. 初期状況
ローカル環境 (localhost:3000) ではメール送信成功 ✅
本番環境（Vercel）ではメールが送信されない ❌
環境変数（SMTPの設定）は Vercel に設定済み
👉 「なぜローカルでは動くのに、本番では失敗するのか？」が問題だった！

❌ 2. 発生していた問題点 & 原因
(1) .env の適用が正しくない可能性
✅ vercel env ls で環境変数が適用されているか確認
✅ vercel env pull で .env を取得し、ローカルと比較
🔍 → 結果：環境変数は正しく設定されていた（問題なし）

(2) secure: true の設定ミス
📌 SMTPの仕様により、ポート465は secure: true にする必要がある！
❌ secure: false のままだと TLS エラーが発生する可能性があった
✅ secure を SMTP_PORT == 465 なら true、それ以外は false に修正

(3) Vercel から SMTP サーバー (e1.valueserver.jp) に接続できていない可能性
1️⃣ ping e1.valueserver.jp → 応答あり（サーバーは生きている） ✅
2️⃣ telnet e1.valueserver.jp 465 → 黒画面のまま反応なし（ポートが閉じている可能性） ❌
3️⃣ openssl s_client -connect e1.valueserver.jp:465 -crlf -quiet
→ SMTPサーバーに接続は成功！ ✅
→ ただし、SMTPコマンドのやりとりが正しく行われていない (500 unrecognised) ❌

🔍 → 結果：SMTPサーバー自体は動いているが、TLS設定や認証方式が影響していた可能性

(4) route.js の nodemailer 設定ミス
環境変数 (process.env.SMTP_PORT) を適切に secure に反映できていなかった
デバッグログ (console.log) を追加して、環境変数の取得状況をチェック
tls.rejectUnauthorized: false を追加し、証明書エラーを回避
✅ 修正後の route.js でメール送信成功！ 🎉

