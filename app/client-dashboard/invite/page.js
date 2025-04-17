"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import Link from "next/link";

export default function ClientInvitePage() {
  const [clientId, setClientId] = useState(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const [message, setMessage] = useState("");

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setClientId(user.uid);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.clientInviteUrl) {
            setInviteUrl(data.clientInviteUrl);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const generateInviteUrl = async () => {
    if (!clientId) return;
    const referralCode = `CQ-CLIENT-${clientId}`;
    const url = `https://console.aiforyou.jp/signup-client?ref=${referralCode}`;

    await setDoc(doc(db, "users", clientId), { clientInviteUrl: url }, { merge: true });

    await setDoc(doc(collection(db, "referral"), referralCode), {
      clientInviteUrl: url,
      createdAt: new Date(),
      referralCode,
      referrerId: clientId,
      referrerStatus: "active",
    });

    setInviteUrl(url);
    setMessage("✅ 紹介URLを発行しました");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setMessage("📋 コピーしました");
    } catch (error) {
      setMessage("❌ コピーに失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">📨 紹介URLの発行</h1>

        <button
          onClick={generateInviteUrl}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          🔄 紹介URLを生成
        </button>

        {inviteUrl && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              以下のURLを紹介に使えます（※このコンテンツは有料プランのみ）：
            </p>
            <input
              type="text"
              value={inviteUrl}
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              📋 コピー
            </button>
          </div>
        )}

        {message && (
          <p className="text-sm text-green-600">{message}</p>
        )}

        <div className="space-y-2 pt-6">
          <Link href="/client-dashboard/referred">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              📋 紹介一覧を見る
            </button>
          </Link>
          <Link href="/client-dashboard">
            <button className="w-full bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">
              🔙 戻る
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
