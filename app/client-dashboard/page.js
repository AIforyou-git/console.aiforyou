"use client";

import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
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
    <div className="max-w-screen-xl mx-auto px-2 pt-20 pb-32 relative bg-gray-50 min-h-screen">
      {/* 🧾 クライアント名で挨拶（小さく＆コンパクト） */}
      <h1 className="text-sm text-center text-gray-500 mb-2">
        {clientName} 様の最新情報
      </h1>

      {/* 🔥 ニュース記事リスト（本文が主役） */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <NewsList />
      </div>

      {/* 🔽 フッター固定メニュー */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow z-40">
        <div className="max-w-screen-md mx-auto flex justify-around items-center py-3">
          <a
            href="https://chat.guaido.ai/room/yy3OIWXmJPw4u2RrpxzRwg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded w-40">
              🤖 AI相談
            </button>
          </a>

          <Link href="/client-dashboard/invite">
            <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded w-40">
              📨 友達に紹介
            </button>
          </Link>
        </div>
      </div>

      {/* ✅ モーダル */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-xl shadow-lg">
            <ClientInfoForm uid={user?.uid} onClose={handleModalClose} />
          </div>
        </div>
      )}

      {/* 🔄 同期中メッセージ */}
      {isSyncing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-xl shadow-lg text-center">
            <p className="text-xl font-bold">🔄 クライアント情報を保存中です...</p>
            <p className="text-sm mt-2 text-gray-600">少々お待ちください。</p>
          </div>
        </div>
      )}
    </div>
  );
}
