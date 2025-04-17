"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useAuth } from "@/lib/authProvider";

export default function AgencyDashboard() {
  const { user } = useAuth(); // ✅ Firebase Auth 状態を共通管理から取得
  const [status, setStatus] = useState("");
  const [agencyUrl, setAgencyUrl] = useState("");
  const [userUrl, setUserUrl] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
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

          if (userData.referralCode) {
            setReferralCode(userData.referralCode);
          } else {
            const newCode = `AG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
            await setDoc(userDocRef, { referralCode: newCode }, { merge: true });
            setReferralCode(newCode);
          }
        }
      } catch (error) {
        console.error("❌ Firestore 読み込みエラー:", error);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (referralCode) {
      setAgencyUrl(`https://console.aiforyou.jp/signup?ref=${referralCode}`);
      setUserUrl(`https://console.aiforyou.jp/signup?ref=USER-${referralCode}`);
    }
  }, [referralCode]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">代理店ダッシュボード</h1>

      {user ? (
        <>
          <div className="mb-6 text-sm text-gray-700">
            <p>ログイン中: <span className="font-semibold">{user.email}</span></p>
            <p>アカウント状態: <span className="font-semibold">{status}</span></p>
          </div>

          {/* 紹介URL */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">紹介URL</h2>
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">代理店登録用URL</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={agencyUrl}
                  className="w-full px-3 py-2 border rounded text-sm bg-gray-100"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(agencyUrl)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  コピー
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">ユーザー登録用URL</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={userUrl}
                  className="w-full px-3 py-2 border rounded text-sm bg-gray-100"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(userUrl)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  コピー
                </button>
              </div>
            </div>
          </div>

          {/* 最新の配信 */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">最新の配信</h2>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
              <div className="bg-gray-100 p-2 rounded">◯月◯日 - クライアント名様</div>
              <div className="bg-gray-100 p-2 rounded">◯月◯日 - クライアント名様</div>
              <div className="bg-gray-100 p-2 rounded">◯月◯日 - クライアント名様</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">※スクロール（最大20件まで）</p>
          </div>

          {/* 登録数情報 */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-700 text-sm shadow">
            🎁 ギフトプランであと◯人登録可能です
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500">読み込み中...</p>
      )}
    </div>
  );
}
