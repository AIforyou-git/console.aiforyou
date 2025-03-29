✅ 各ファイルの役割
📁 /app/api/auth/register-user/route.js
🔧 役割：
ユーザーの仮登録（Firestore + Firebase Auth）

仮パスワードの生成

紹介コードから紹介元の抽出

send-email API を呼び出して通知メールを送信

🔍 主な処理：
email, referredBy を受け取る

referredBy から referrerId を抽出

仮パスワード生成

Firebase Auth にユーザー登録

Firestore に users ドキュメントを保存（status: pending）

/api/auth/send-email に対して POST リクエストを送信（email, tempPassword）

📁 /app/api/auth/send-email/route.js
🔧 役割：
SMTP 経由でメール送信を行う専用API

register-user から呼び出され、初期ログイン情報を送信

🔍 主な処理：
email, tempPassword を受け取る

SMTP 環境変数を使って nodemailer を設定

初回ログイン案内メールの内容を作成

transporter.sendMail() でメール送信

成功 or 失敗のレスポンスを返す

🔁 全体の連動フロー（処理ステップ）
plaintext
コピーする
編集する
1️⃣ クライアントが紹介URLからメールアドレスを送信（referredBy付き）
   ⬇
2️⃣ [register-user] API が呼び出される
   - email, referredBy を取得
   - 仮パスワード生成
   - Firebase Auth にユーザー作成
   - Firestore「users」にステータス pending で保存
   ⬇
3️⃣ [send-email] API を内部的に呼び出す（POST）
   - email, tempPassword を渡す
   - SMTP 経由で初期ログイン情報を送信
   ⬇
4️⃣ クライアントは受信したメールの情報でログインできる