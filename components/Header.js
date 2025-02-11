"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // ✅ ページのパスを取得
import "@/styles/header.css";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUserPlus, faUsers, faCog, faInfoCircle, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { signOut } from "firebase/auth"; // ✅ Firebase のログアウト機能をインポート
import { firebaseAuth } from "@/lib/firebase"; // ✅ Firebase 認証の設定
import { useRouter } from "next/navigation"; // ✅ Next.js のルーティング用

export default function Header() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // 現在のパスを取得

  useEffect(() => {
    setIsClient(true); // ✅ クライアント側でのみ実行
  }, []);

  // ✅ ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      router.push("/login"); // 🔄 ログアウト後にログイン画面へ遷移
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
    }
  };

  // ✅ ログインページではヘッダーを表示しない
  if (pathname === "/login") return null;

return (
  <header className="header">
    <div className="logo">AIforyou</div>
    <nav>
      <ul className="menu">
        {isClient && ( // ✅ クライアント側でのみレンダリング
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
