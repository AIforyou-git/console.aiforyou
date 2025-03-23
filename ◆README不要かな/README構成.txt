構成README

最終形態＞

console.aiforyou.jp/
│── app/                     # Next.js の `app` ディレクトリ
│   ├── layout.js           # 全ページ共通のレイアウト
│   ├── page.tsx             # トップページ　（loginにリダイレクト）
│   ├── providers.tsx        #【認証プロバイダー設定ファイル】

│   ├── login/               # 🔥 ログイン関連
│   │   ├── page.js         # ログイン画面

│   ├── dashboard/           # 🔥 ダッシュボード
│   │   ├── page.js         # ダッシュボードメイン

│   ├── customers/           # 📂 顧客管理
│   │   ├── page.js         # 顧客一覧
│   │   ├── create/         # 顧客登録ページ
│   │   │     ├── page.js   # 新規登録画面　パターン①
│   ├── settings/            # 📂 設定ページ
│   │   ├── page.js

│   ├── info/                # 📂 情報ページ
│   │   ├── page.js
│
│── styles/                  # 💡 CSSを一箇所にまとめる
│   ├── globals.css          # ✅ 全体のベーススタイル
│   ├── header.css           # ✅ ヘッダー共通

│   ├── pages/               # 📂 各ページ専用のCSS
│   │   ├── login.css        # 🔥 ログインページ専用
│   │   ├── dashboard.css    # 🔥 ダッシュボード専用
│   │   ├── customers.css    # 🔥 顧客一覧ページ
│   │   ├── customerslist.css    # 🔥 顧客登録ページ
│   │   ├── settings.css     # 🔥 設定ページ
│   │   ├── info.css         # 🔥 情報ページ
│
│── components/              # ✅ 共通コンポーネント
│   ├── Header.js           # ✅ ヘッダー
│
│── public/                  # 📂 画像や静的ファイル
│   ├── favicon.ico
│   ├── logo.png
│── lib/                     # 🔥 FirebaseやAPIの設定
│   ├── firebase.js          # Firebase 設定
│   ├── firebaseConfig.js     # Firebase 設定
│── node_modules/              # 🔥 プログラム各種

│── middleware.ts            # ✅ 認証チェック
│── next/   　　　          # ✅ Next.js 設定　以下ファイル各種
│── package.json             # ✅ パッケージ管理
│── package.json-lock.json    # ✅ パッケージ管理

│── tsconfig.json            # ✅ TypeScript 設定
│── .env.local               # ✅ 環境変数

│── .gitignore"　　　　　　# Gitで管理しないファイルやフォルダを指定する設定ファイル。
│── eslint.config.mjs"　　　# ESLint（静的解析ツール）の設定ファイル。
│── next.config.ts"　　　   # Next.jsのカスタム設定を定義するTypeScriptファイル。
│── next-env.d.ts"　　    　# TypeScriptの型定義ファイルで、Next.jsの型情報を提供する。
│── postcss.config.mjs"　　　　# CSSの処理ツール「PostCSS」の設定ファイル。
│── tailwind.config.ts"　　　　# Tailwind CSSのカスタム設定を定義するTypeScriptファイル。
│── README.md"
│── READMEconsole.aiforyou.txt"
│── 構成READMEconsole.aiforyou.txt"



【ログインの構成】

onsole.aiforyou.jp/
│── app/
│   ├── layout.js  # 全体のレイアウト
│   ├── login/     # ログインページ
│   ├── signup/    # 新規登録ページ
│   ├── dashboard/
│   │   ├── admin-dashboard/
│   │   ├── agency-dashboard/
│   │   ├── user-dashboard/
│   │   ├── client-dashboard/
│
│── components/              # 共通コンポーネント
│   ├── HeaderAdmin.js
│   ├── HeaderAgency.js
│   ├── HeaderUser.js
│   ├── HeaderClient.js
│
│── lib/                     # Firebase 設定
│   ├── firebase.js
│   ├── authProvider.js  # 認証管理
│
│── api/
│   ├── auth/
│   │   ├── register.js  # ユーザー登録API
│   │   ├── login.js     # ログインAPI
│
│── middleware.ts  # 認証チェック & リダイレクト
│── package.json  # パッケージ管理
│── tailwind.config.ts  # Tailwind CSS 設定


修正
【ログインの構成】

onsole.aiforyou.jp/
│── app/
│   ├── layout.js  # 全体のレイアウト
│   ├── login/     # ログインページ
│   ├── signup/    # 新規登録ページ

│   ├── client-register/ ※userの各ページ
│   ├── customers/　※userの各ページ
│   ├── info/　※userの各ページ
│   ├── settings/　※userの各ページ
│   ├── invite/　?


│   ├── admin-dashboard/
│   ├── agency-dashboard/
│   ├── user-dashboard/
│   ├── client-dashboard/

│   ├── page.tsx/
│   ├── providers.tsx/

　　│── api/
　　│   ├── auth/
　　│   │   ├── login    
　　│   │   ├── referral     
　　│   │   ├── register     
　　│   │   ├── send-email     

│
│── components/              # 共通コンポーネント
│   ├── HeaderAdmin.js
│   ├── HeaderAgency.js
│   ├── HeaderUser.js
│   ├── HeaderClient.js
│
│── lib/                     # Firebase 設定
│   ├── firebase.js
│   ├── firebaseAdmin.js
│   ├── firestore.js
│   ├── authProvider.js  # 認証管理
│   ├── authUtils.js 

│
│── api/
│   ├── auth/
│   │   ├── register.js  # ユーザー登録API
│   │   ├── login.js     # ログインAPI
│
│── styles/                  # 💡 CSSを一箇所にまとめる
│   ├── globals.css          # ✅ 全体のベーススタイル
│   ├── header.css           # ✅ ヘッダー共通

│   ├── pages/ 

│── middleware.ts  # 認証チェック & リダイレクト
│── package.json  # パッケージ管理
│── tailwind.config.ts  # Tailwind CSS 設定