// app/layout.js
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
  const { loading } = useAuth(); // ✅ 認証状態の取得

  // ✅ loading 中は画面を白にして描画抑制（ちらつき・null崩壊防止）
  if (loading) {
    return <div className="w-screen h-screen bg-white" />;
  }

  const suppressHeaderPaths = [
  "/signup-sb",
  "/login-sb",
  "/login/recover/reset-password",
  "/auth/callback" // ✅ ← これを追加
];

  const isSuppressed = suppressHeaderPaths.some((p) =>
    pathname.startsWith(p)
  );

  if (pathname === "/preparing" || isSuppressed) {
    return <main className="pt-8 px-6">{children}</main>;
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
