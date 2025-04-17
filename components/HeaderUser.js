"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers,
  faUserPlus,
  faInfoCircle,
  faCog,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export default function HeaderUser() {
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

  if (pathname === "/login") return null;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#1c2b3a] text-white px-4 py-3 shadow-md flex justify-between items-center">
      {/* ロゴ */}
      <div className="text-lg font-semibold tracking-wide">AIforyou User</div>

      {/* ナビメニュー */}
      <nav>
        <ul className="flex items-center gap-6 text-xl">
          <li title="ホーム">
            <Link href="/user-dashboard">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </li>

          <li title="顧客一覧">
            <Link href="/user-dashboard/customers">
              <FontAwesomeIcon icon={faUsers} />
            </Link>
          </li>

          <li title="顧客登録">
            <Link href="/user-dashboard/customers/create">
              <FontAwesomeIcon icon={faUserPlus} />
            </Link>
          </li>

          <li title="情報">
            <Link href="/user-dashboard/info">
              <FontAwesomeIcon icon={faInfoCircle} />
            </Link>
          </li>

          <li title="設定">
            <Link href="/user-dashboard/settings">
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
