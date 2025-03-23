"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUser, faCog, faSignOutAlt, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import "@/styles/header.css";

export default function HeaderClient() {
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
    <header className="header">
      <div className="logo">AIforyou Client</div>
      <nav>
        <ul className="menu">
          <li data-tooltip="ホーム">
            <Link href="/client-dashboard">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </li>
          {/* 🔥 未実装ページは準備中ページへ誘導 */}
          <li data-tooltip="プロフィール">
            <Link href="/client-dashboard/create">
              <FontAwesomeIcon icon={faUser} />
            </Link>
          </li>
          <li data-tooltip="設定">
          <Link href="/client-dashboard/settings">
              <FontAwesomeIcon icon={faCog} />
            </Link>
          </li>
          <li data-tooltip="ログアウト">
            <button className="logout-button" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
