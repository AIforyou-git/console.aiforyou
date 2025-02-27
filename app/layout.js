"use client";
import Header from "@/components/Header";
import { AuthProvider } from "@/lib/authProvider"; // ✅ 認証プロバイダーを追加

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider> {/* ✅ 認証チェックを適用 */}
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
