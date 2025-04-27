"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUser, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/lib/authProvider";
import { AlertDialog } from "@/components/ui/alert-dialog";

export default function HeaderClient() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("❌ ログアウトに失敗しました:", error);
    }
  };

  if (loading || !user || pathname === "/login" || pathname === "/login-sb") return null;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#2c3e50] text-white px-4 py-3 shadow-md flex justify-between items-center">
      <div className="text-lg font-semibold tracking-wide">AIforyou Client</div>

      <nav>
        <ul className="flex items-center gap-6 text-xl">
          <li title="ホーム">
            <Link href="/client-dashboard">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </li>
          <li title="プロフィール">
            <Link href="/client-dashboard/create">
              <FontAwesomeIcon icon={faUser} />
            </Link>
          </li>
          <li title="設定">
            <Link href="/client-dashboard/settings">
              <FontAwesomeIcon icon={faCog} />
            </Link>
          </li>
          <li title="ログアウト">
            <AlertDialog
              trigger={<FontAwesomeIcon icon={faSignOutAlt} />}
              title="ログアウトしますか？"
              description="現在のセッションが終了します。よろしいですか？"
              onConfirm={handleLogout}
            />
          </li>
        </ul>
      </nav>
    </header>
  );
}
