"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUsers, faUserPlus, faInfoCircle, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import "@/styles/header.css";

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
    <header className="header">
      <div className="logo">AIforyou User</div>
      <nav>
        <ul className="menu">
          <li data-tooltip="ホーム">
            <Link href="/user-dashboard">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </li>

          <li data-tooltip="顧客一覧">
            <Link href="/user-dashboard/customers">
              <FontAwesomeIcon icon={faUsers} />
            </Link>
          </li>

          <li data-tooltip="顧客登録">
            <Link href="/user-dashboard/customers/create">
              <FontAwesomeIcon icon={faUserPlus} />
            </Link>
          </li>

          <li data-tooltip="情報">
            <Link href="/user-dashboard/info">
              <FontAwesomeIcon icon={faInfoCircle} />
            </Link>
          </li>

          <li data-tooltip="設定">
            <Link href="/user-dashboard/settings">
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
