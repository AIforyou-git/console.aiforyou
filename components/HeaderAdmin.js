"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBuilding,
  faUsers,
  faUserTie,
  faInfoCircle,
  faCog,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "@/lib/authProvider";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabaseClient"; // 🔥 追加（必須）

export default function HeaderAdmin() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      // 🔥 まず現在ログイン中のユーザーを取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const now = new Date().toISOString();

      // 🔥 logout_logsにINSERT
      if (user?.id) {
        await supabase.from('logout_logs').insert([
          {
            uid: user.id,
            logout_time: now,
          },
        ]);
      }

      // 🔥 その後ログアウト処理
      await logout();
      router.replace("/login?logout=1");
    } catch (error) {
      console.error("❌ ログアウトに失敗しました:", error);
    }
  };

  if (loading || pathname === "/login") return null;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#1c2b3a] text-white px-4 py-3 shadow-md flex justify-between items-center">
      <div className="text-lg font-semibold tracking-wide">AIforyou Admin</div>

      <nav>
        <ul className="flex items-center gap-6 text-xl">
          <li title="ホーム">
            <Link href="/admin-dashboard">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </li>
          <li title="代理店管理">
            <Link href="/preparing">
              <FontAwesomeIcon icon={faBuilding} />
            </Link>
          </li>
          <li title="ユーザー管理">
            <Link href="/preparing">
              <FontAwesomeIcon icon={faUsers} />
            </Link>
          </li>
          <li title="クライアント管理">
          <Link href="/preparing">
              <FontAwesomeIcon icon={faUserTie} />
            </Link>
          </li>
          <li title="情報">
            <Link href="/admin-dashboard/info">
              <FontAwesomeIcon icon={faInfoCircle} />
            </Link>
          </li>
          <li title="設定">
            <Link href="/admin-dashboard/settings">
              <FontAwesomeIcon icon={faCog} />
            </Link>
          </li>
          <li title="ログアウト">
            <AlertDialog
              trigger={<FontAwesomeIcon icon={faSignOutAlt} />}
              title="ログアウトしますか？"
              description="管理者セッションを終了します。よろしいですか？"
              onConfirm={handleLogout}
            />
          </li>
        </ul>
      </nav>
    </header>
  );
}
