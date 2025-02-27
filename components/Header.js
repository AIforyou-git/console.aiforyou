"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/header.css";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUserPlus, faUsers, faCog, faInfoCircle, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { logLogoutEvent } from "@/lib/authUtils"; // 🔥 Firestore のログアウト処理をインポート

export default function Header() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ ログアウト処理（Firestore に記録を追加）
  const handleLogout = async () => {
    try {
      const user = firebaseAuth.currentUser;
      if (user) {
        console.log("🟡 Firestore にログアウト情報を記録中:", user.email);
        await logLogoutEvent(user); // 🔥 Firestore に `logoutTimestamp` を記録
      }

      await signOut(firebaseAuth);
      router.push("/login"); // 🔄 ログイン画面へ遷移
      console.log("✅ ユーザーがログアウトしました");
    } catch (error) {
      console.error("❌ ログアウトに失敗しました:", error);
    }
  };

  if (pathname === "/login") return null;

  return (
    <header className="header">
      <div className="logo">AIforyou</div>
      <nav>
        <ul className="menu">
          {isClient && (
            <>
              <li data-tooltip="ホーム">
                <Link href="/dashboard">
                  <FontAwesomeIcon icon={faHome} />
                </Link>
              </li>

              <li data-tooltip="顧客登録">
                <Link href="/customers/create">
                  <FontAwesomeIcon icon={faUserPlus} />
                </Link>
              </li>

              <li data-tooltip="顧客一覧">
                <Link href="/customers">
                  <FontAwesomeIcon icon={faUsers} />
                </Link>
              </li>

              <li data-tooltip="設定">
                <Link href="/settings">
                  <FontAwesomeIcon icon={faCog} />
                </Link>
              </li>

              <li data-tooltip="情報">
                <Link href="/info">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </Link>
              </li>

              {/* 🔄 ログアウト処理をボタンで実装 */}
              <li data-tooltip="ログアウト">
                <button className="logout-button" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
