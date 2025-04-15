"use client";

import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import "./client-dashboard.css";
import ClientInfoForm from "./ClientInfoForm";
import NewsList from "./news-control/NewsList";

export default function ClientDashboard() {
  const [userData, setUserData] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [clientName, setClientName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const clientRef = doc(db, "clients", currentUser.uid);
      const clientSnap = await getDoc(clientRef);

      let clientData = null;

      if (!clientSnap.exists()) {
        await setDoc(clientRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          profileCompleted: false,
          createdAt: new Date(),
        });
        clientData = { profileCompleted: false };
        console.log("✅ clients に初期プロフィール作成");
      } else {
        clientData = clientSnap.data();
      }

      if (!clientData?.profileCompleted) {
        setShowInfoModal(true);
      }

      // 🔹 クライアント名を取得（優先度: name > displayName > email）
      const nameFromClient = clientData?.name;
      const displayNameFromAuth = currentUser.displayName;
      const emailName = currentUser.email?.split("@")[0];

      setClientName(nameFromClient || displayNameFromAuth || emailName);

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setStatus(userData.status);

        if (userData.status === "pending") {
          await updateDoc(userDocRef, {
            status: "active",
            lastLogin: new Date().toISOString(),
          });
          setStatus("active");
        } else {
          await updateDoc(userDocRef, {
            lastLogin: new Date().toISOString(),
          });
        }
      }

      setUserData(userData);
    });

    return () => unsubscribe();
  }, [router]);

  const handleModalClose = async () => {
    setShowInfoModal(false);
    setIsSyncing(true);

    try {
      const res = await fetch("/api/auth/sync-client-to-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user?.uid }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("❌ Supabase 同期エラー:", data.error);
      } else {
        console.log("✅ Supabase にクライアント＆アカウント情報を同期しました");
      }
    } catch (err) {
      console.error("❌ Supabase 同期通信失敗:", err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* 🧾 クライアント名で挨拶表示 */}
      <h1 className="dashboard-title text-xl font-bold text-center mb-4">
        {clientName} 様の最新情報
      </h1>

      {/* 🔥 Supabase 記事リスト */}
      <div className="news-list">
        <NewsList />
      </div>

      {/* 🔥 画面下部の固定メニュー */}
      <div className="fixed-bottom-menu">
        <a
          href="https://chat.guaido.ai/room/yy3OIWXmJPw4u2RrpxzRwg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="menu-btn">🤖 AI相談</button>
        </a>

        <Link href="/client-dashboard/invite">
          <button className="menu-btn">📨 友達に紹介</button>
        </Link>
      </div>

      {/* ✅ プロフィールモーダル */}
      {showInfoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ClientInfoForm uid={user?.uid} onClose={handleModalClose} />
          </div>
        </div>
      )}

      {/* 🔄 Supabase 同期中メッセージ */}
      {isSyncing && (
        <div className="modal-overlay">
          <div className="modal-content text-center">
            <p className="text-xl font-bold">🔄 クライアント情報を保存中です...</p>
            <p className="text-sm mt-2 text-gray-600">少々お待ちください。</p>
          </div>
        </div>
      )}
    </div>
  );
}
