まず全体の構成として、
ログイン画面　
サインアップ
ユーザー用サインアップ
admin　ダッシュボード
代理店　ダッシュボード
ユーザー　ダッシュボード
クライアント　ダッシュボード
に分かれていて、それをヘッダーコンポーネントしてあります。
layoutでログインページや特定のページにはヘッダーを表示させないという形式で制御しています。
その為　グローバルCSS等活用し　各々のページで調整が利く様にという形式


①まず、fbのユーザーに関わる情報を
クライアント入力　＞Authentication 内容　FB反映　＞FBからsupabase保存
更新や追加も同じく　＞clientsあたりを収得
これをユーザーデータベースとして色々使えるように纏めておく

②完成したデータベースから　地域、業種をマッチングさせてＵＩに反映させる

このような流れを作りたい。

情報側（スクレイピング側）のデータベースの型はある程度固まってsupabaseに反映されているので今はまず、クライアント情報をsupabase に落とし込みたいと思います。
＜クライアントの新規登録の流れ＞
①クライアントはsingup（新規登録）からメールアドレスのみを入力して送信実行します。
②クライアントが送信したメールアドレス宛に仮パスワードのメールが届きます。
③その時点でAuthenticationにUIDが登録されログイン出来る状態になります。コレクションuser設置されます。
クライアントがログインをすると、statusが "active"に変更します。
初回登録時にモーダルを表示させて必須登録させる事になっています。名前、業種、地域


-users-収得情報 （例）
clientInviteUrl
"https://console.aiforyou.jp/signup-client?ref=CQ-CLIENT-k4ESMcsMsHXpgnCBbxn2kOmIrnL2"
（文字列）


createdAt
2025年3月23日 11:31:09 UTC+9
（タイムスタンプ）


email
"tsd.nogawa+user10@gmail.com"
（文字列）


lastLogin
"2025/3/24 11:52:21"
（文字列）


referredBy
"jUaVL5R91BQKr0nw2fL1005J2kA2"
（文字列）


role
"client"
（文字列）


status
"active"
（文字列）


uid
"k4ESMcsMsHXpgnCBbxn2kOmIrnL2"

この中で、clientInviteUrl、はログイン後の紹介コード生成を行わないと発現しません。
なのでデフォルトは7項目となります。
ここから収得できる
clientInviteUrl
createdAt
email
lastLogin
referredBy
role
status
uid
はすべて収得出来るようにしたい。
④ログインしたクライアントは自分自身、もしくは管理者によりプロフィールや情報を更新・追記する事が出来ます。コレクション　clients
この項目は今後も拡張するのですが、現在の情報は収得出来るようにしたい。入力は任意なので入力なしなら無しでいいです。
コレクション　clients　項目（例）
company
"ラッキー7株式会社"
（文字列）


createdAt
2025年3月23日 8:31:45 UTC+9
（タイムスタンプ）


email
"tsd.nogawa+user7@gmail.com"
（文字列）


industry
"医療・福祉"
（文字列）


memo
"医療関係ですが患者はおりません"
（文字列）


name
"ラッキー7"
（文字列）


position
"代表"
（文字列）


profileCompleted
true
（ブール値）


regionCity
"八王子市"
（文字列）


regionPrefecture
"石川県"
（文字列）


uid
"6G0AcrrN6LhGlmuIMDWjpXv74Mo2"
（文字列）


updatedAt
2025年3月23日 8:38:47 UTC+9

こちらは全12項ですが、usersと重複するものもあります。
company
createdAt
email
industry
memo
name
position
profileCompleted
regionCity
regionPrefecture
uid
updatedAt

これらをsupabase に反映される処理をしたい。
登録があった時点で即反映
変更があったら即反映という形がいいです。
このクライアント基本情報はadminでも管理できるようにしたいと思います。
どうですか？理解できますか？ブレスト