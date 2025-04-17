"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Link from "next/link";

export default function InvitePage() {
  const [adminId, setAdminId] = useState(null);
  const [agencyUrl, setAgencyUrl] = useState("");
  const [userUrl, setUserUrl] = useState("");
  const [clientUrl, setClientUrl] = useState("");
  const [message, setMessage] = useState("");

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAdminId(user.uid);
        const docRef = doc(db, "admin", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setAgencyUrl(data.agencyInviteUrl || "");
          setUserUrl(data.userInviteUrl || "");
          setClientUrl(data.clientInviteUrl || "");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const generateUrls = async () => {
    if (!adminId) return;

    const agencyInviteUrl = `https://console.aiforyou.jp/signup?ref=HQ-AGENCY`;
    const userInviteUrl = `https://console.aiforyou.jp/signup?ref=HQ-USER`;
    const clientInviteUrl = `https://console.aiforyou.jp/signup?ref=HQ-CLIENT`;

    const docRef = doc(db, "admin", adminId);
    await setDoc(
      docRef,
      {
        agencyInviteUrl,
        userInviteUrl,
        clientInviteUrl,
      },
      { merge: true }
    );

    setAgencyUrl(agencyInviteUrl);
    setUserUrl(userInviteUrl);
    setClientUrl(clientInviteUrl);
    setMessage("✅ 紹介URLを再設定しました");
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("📋 コピーしました！");
    } catch (error) {
      setMessage("❌ コピーに失敗しました");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">紹介URLの作成</h1>

      <button
        onClick={generateUrls}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        🔄 紹介URLを再生成
      </button>

      <div className="space-y-6">
        {/* 代理店 */}
        <div>
          <h3 className="text-lg font-semibold mb-1">代理店登録用URL</h3>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={agencyUrl}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
            />
            <button
              onClick={() => copyToClipboard(agencyUrl)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              コピー
            </button>
          </div>
        </div>

        {/* ユーザー */}
        <div>
          <h3 className="text-lg font-semibold mb-1">ユーザー登録用URL</h3>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={userUrl}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
            />
            <button
              onClick={() => copyToClipboard(userUrl)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              コピー
            </button>
          </div>
        </div>

        {/* クライアント */}
        <div>
          <h3 className="text-lg font-semibold mb-1">クライアント登録用URL</h3>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={clientUrl}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
            />
            <button
              onClick={() => copyToClipboard(clientUrl)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              コピー
            </button>
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-4 text-sm text-green-600 font-medium">{message}</p>
      )}

      {/* 戻るボタン */}
      <div className="mt-8">
        <Link href="/admin-dashboard">
          <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
            ← ダッシュボードに戻る
          </button>
        </Link>
      </div>
    </div>
  );
}
