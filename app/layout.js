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

  const suppressHeaderPaths = ["/signup-sb", "/login-sb"];
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
      <body className="text-gray-800 bg-gray-50 min-h-screen">
        <ToastProvider>
          <AuthProvider> {/* ✅ Supabase context を全体に適用 */}
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
