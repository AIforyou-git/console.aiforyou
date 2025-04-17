"use client";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/authProvider";
import HeaderAdmin from "@/components/HeaderAdmin";
import HeaderUser from "@/components/HeaderUser";
import HeaderClient from "@/components/HeaderClient";
import HeaderAgency from "@/components/HeaderAgency";
import "../styles/globals.css"; // Tailwind を確実に読み込む

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // `/preparing` ページは認証・ヘッダーなしでそのまま表示
  if (pathname === "/preparing") {
    return (
      <html lang="ja">
        <body className="text-gray-800 bg-gray-50 min-h-screen">
          <main className="pt-8 px-6">{children}</main>
        </body>
      </html>
    );
  }

  let HeaderComponent = null;
  if (pathname.startsWith("/admin-dashboard")) {
    HeaderComponent = HeaderAdmin;
  } else if (pathname.startsWith("/user-dashboard")) {
    HeaderComponent = HeaderUser;
  } else if (pathname.startsWith("/client-dashboard")) {
    HeaderComponent = HeaderClient;
  } else if (pathname.startsWith("/agency-dashboard")) {
    HeaderComponent = HeaderAgency;
  }

  return (
    <html lang="ja">
      <body className="text-gray-800 bg-gray-50 min-h-screen">
        <AuthProvider>
          {HeaderComponent && <HeaderComponent />}
          <main className="pt-8 px-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
