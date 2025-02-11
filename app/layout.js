import Header from "@/components/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <Header /> {/* ✅ 確実にヘッダーを表示 */}
        <main>{children}</main>
      </body>
    </html>
  );
}
