✅ 現在の構成の整理と影響範囲
① layout.js の役割と影響範囲【全ページに関与】
js
コピーする
編集する
<AuthProvider>
  {HeaderComponent && <HeaderComponent />}
  <main>{children}</main>
</AuthProvider>
pathname に応じて4種類のヘッダー（Admin, User, Client, Agency）を切り替えて表示

/preparing の場合は AuthProvider を通さず、素の画面を出す

AuthProvider に全体の認証管理が委ねられている（Firebaseセッション or NextAuthなど）

📌 影響：

すべてのルートは layout.js を通るため、この中での変更は全体に波及します。

HeaderXxx が未使用であっても、import されてる限り ビルド・バンドルに影響します。

ユーザー判定は pathname に依存 → セッションの role 情報ではなく、URLのprefix が基準になっている。

② page.tsx の役割【アプリの起点】
ts
コピーする
編集する
export default function Home() {
  redirect("/login");
  return null;
}
http://localhost:3000/ アクセス時は必ず /login に飛ばすシンプルな制御

特に副作用や認証はないが、トップページは存在しない構成

📌 影響：

/ で何かを表示したい場合は、page.tsx を修正する必要あり

ここを「ログイン判定 → ロール別にリダイレクト」などにすることも可能（例：ログイン済なら /user-dashboard へ）

③ providers.tsx の役割と現状
tsx
コピーする
編集する
<SessionProvider>{children}</SessionProvider>
next-auth/react を使ったセッション管理のための Provider

ただし layout.js では使われておらず、現在未使用 と思われます（layout.js は AuthProvider のみ）

📌 影響：

providers.tsx は将来的な SessionProvider 組み込みを意識して書かれているようですが、

現時点では layout.js 側で AuthProvider が優先されており、実質未使用状態

