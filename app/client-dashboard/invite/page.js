// /client-dashboard/invite/page.js
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
    const userRef = doc(db, "users", clientId);
    const referralCode = `CQ-CLIENT-${clientId}`;
    const url = `https://console.aiforyou.jp/signup-client?ref=${referralCode}`;

    await setDoc(userRef, { clientInviteUrl: url }, { merge: true });

    // ✅ referral コレクションにも追加
    await setDoc(doc(collection(db, "referral"), referralCode), {
      clientInviteUrl: url,
      createdAt: new Date(),
      referralCode: referralCode,
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
    <div className="invite-page">
      <h1>📨 紹介URLの発行</h1>

      <button onClick={generateInviteUrl}>🔄 紹介URLを生成</button>

      {inviteUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>以下のURLを紹介に使えます ※このコンテンツは有料プランのみ：</p>
          <input type="text" value={inviteUrl} readOnly style={{ width: "100%" }} />
          <button onClick={copyToClipboard}>コピー</button>
        </div>
      )}

      {message && <p>{message}</p>}

      {/* 🔗 紹介一覧ページへのリンク */}
      <div style={{ marginTop: "30px" }}>
        <Link href="/client-dashboard/referred">
          <button>📋 紹介一覧を見る</button>
        </Link>
      </div>

      {/* 🔙 戻るボタンを追加 */}
      <div style={{ marginTop: "20px" }}>
        <Link href="/client-dashboard">
          <button>🔙 戻る</button>
        </Link>
      </div>
    </div>
  );
}