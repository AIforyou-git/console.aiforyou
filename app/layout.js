"use client";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/authProvider";
import HeaderAdmin from "@/components/HeaderAdmin";
import HeaderUser from "@/components/HeaderUser";
import HeaderClient from "@/components/HeaderClient";
import HeaderAgency from "@/components/HeaderAgency";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // `/preparing` だけは認証なしで表示
  if (pathname === "/preparing") {
    return (
      <html lang="ja">
        <body>
          <main>{children}</main>
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
      <body>
        <AuthProvider>
          {HeaderComponent && <HeaderComponent />}
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
