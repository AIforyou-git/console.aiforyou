"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBuilding, faUsers, faUserTie, faInfoCircle, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import "@/styles/header.css";

export default function HeaderAgency() {
  const pathname = usePathname();
  const router = useRouter();

  // 🔄 代理店のログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      router.push("/login");
    } catch (error) {
      console.error("❌ ログアウトに失敗しました:", error);
    }
  };

  // 🔄 ログインページではヘッダーを非表示
  if (pathname === "/login") return null;

  return (
    <header className="header">
      <div className="logo">AIforyou Agency</div>
      <nav>
        <ul className="menu">
          <li data-tooltip="ホーム">
            <Link href="/agency-dashboard">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </li>
          <li data-tooltip="代理店管理">
            <Link href="/preparing">
              <FontAwesomeIcon icon={faBuilding} />
            </Link>
          </li>
          <li data-tooltip="ユーザー管理">
            <Link href="/preparing">
              <FontAwesomeIcon icon={faUsers} />
            </Link>
          </li>
          <li data-tooltip="クライアント管理">
            <Link href="/agency-dashboard/customers">
              <FontAwesomeIcon icon={faUserTie} />
            </Link>
          </li>
          <li data-tooltip="情報">
            <Link href="/agency-dashboard/info">
              <FontAwesomeIcon icon={faInfoCircle} />
            </Link>
          </li>
          <li data-tooltip="設定">
            <Link href="/agency-dashboard/settings">
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
