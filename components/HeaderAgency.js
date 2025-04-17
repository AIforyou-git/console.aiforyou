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
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export default function HeaderAgency() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      router.push("/login");
    } catch (error) {
      console.error("❌ ログアウトに失敗しました:", error);
    }
  };

  // ログイン画面では非表示
  if (pathname === "/login") return null;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#1c2b3a] text-white px-4 py-3 shadow-md flex justify-between items-center">
      {/* ロゴ */}
      <div className="text-lg font-semibold tracking-wide">AIforyou Agency</div>

      {/* ナビゲーション */}
      <nav>
        <ul className="flex items-center gap-6 text-xl">
          <li title="ホーム">
            <Link href="/agency-dashboard">
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
            <Link href="/agency-dashboard/customers">
              <FontAwesomeIcon icon={faUserTie} />
            </Link>
          </li>
          <li title="情報">
            <Link href="/agency-dashboard/info">
              <FontAwesomeIcon icon={faInfoCircle} />
            </Link>
          </li>
          <li title="設定">
            <Link href="/agency-dashboard/settings">
              <FontAwesomeIcon icon={faCog} />
            </Link>
          </li>
          <li title="ログアウト">
            <button onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
