"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
    const docRef = doc(db, "admin", adminId);
    const agencyInviteUrl = `https://console.aiforyou.jp/signup?ref=HQ-AGENCY`;
    const userInviteUrl = `https://console.aiforyou.jp/signup?ref=HQ-USER`;
    const clientInviteUrl = `https://console.aiforyou.jp/signup?ref=HQ-CLIENT`;

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
    <div className="invite-page">
      <h1>紹介URLの作成</h1>

      <button onClick={generateUrls}>🔄 紹介URLを再生成</button>

      <div style={{ marginTop: "20px" }}>
        <h3>代理店登録用URL</h3>
        <input type="text" value={agencyUrl} readOnly />
        <button onClick={() => copyToClipboard(agencyUrl)}>コピー</button>
      </div>

      <div>
        <h3>ユーザー登録用URL</h3>
        <input type="text" value={userUrl} readOnly />
        <button onClick={() => copyToClipboard(userUrl)}>コピー</button>
      </div>

      <div>
        <h3>クライアント登録用URL</h3>
        <input type="text" value={clientUrl} readOnly />
        <button onClick={() => copyToClipboard(clientUrl)}>コピー</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}
