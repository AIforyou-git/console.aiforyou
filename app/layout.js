"use client";

import { usePathname } from "next/navigation";
import { ToastProvider } from "@/components/ui/use-toast";
import { AuthProvider, useAuth } from "@/lib/authProvider";

import HeaderAdmin from "@/components/HeaderAdmin";
import HeaderUser from "@/components/HeaderUser";
import HeaderClient from "@/components/HeaderClient";
import HeaderAgency from "@/components/HeaderAgency";

import "../styles/globals.css";

function LayoutContent({ children }) {
  const pathname = usePathname();

  // ✅ 認証が不要なパス一覧
  const suppressHeaderPaths = [
    "/signup-sb",
    "/login-sb"
  ];

  const isBypassAuth = pathname === "/reset-password"; // ✅ セッション取得スキップ対象を明示
  const isSuppressed = suppressHeaderPaths.some((p) =>
    pathname.startsWith(p)
  );

  // ✅ 認証取得は必要なときのみ実行
  const { loading } = isBypassAuth ? { loading: false } : useAuth();

  // ✅ セッション待機中は白画面（ただし /reset-password は除外済）
  if (loading) {
    return <div className="w-screen h-screen bg-white" />;
  }

  // ✅ ヘッダーを抑制するページ
  if (pathname === "/preparing" || isSuppressed || isBypassAuth) {
    return <main className="pt-8 px-6">{children}</main>;
  }

  // ✅ ロールに応じたヘッダー切替
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
    <>
      {HeaderComponent && <HeaderComponent />}
      <main className="pt-8 px-6">{children}</main>
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="text-gray-800 bg-gray-50 min-h-screen">
        <ToastProvider>
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
