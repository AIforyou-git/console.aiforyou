"use client";

import { useEffect, useState } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import "@/styles/pages/dashboard.css";

export default function AgencyDashboard() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [agencyUrl, setAgencyUrl] = useState("");
  const [userUrl, setUserUrl] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setStatus(userData.status);

        if (userData.status === "pending") {
          await updateDoc(userDocRef, { status: "active", lastLogin: new Date().toISOString() });
          setStatus("active");
        } else {
          await updateDoc(userDocRef, { lastLogin: new Date().toISOString() });
        }

        if (userData.referralCode) {
          setReferralCode(userData.referralCode);
        } else {
          const newCode = `AG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
          await setDoc(userDocRef, { referralCode: newCode }, { merge: true });
          setReferralCode(newCode);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (referralCode) {
      setAgencyUrl(`https://console.aiforyou.jp/signup?ref=${referralCode}`);
      setUserUrl(`https://console.aiforyou.jp/signup?ref=USER-${referralCode}`);
    }
  }, [referralCode]);

  return (
    <div className="container">
      <h1>代理店ダッシュボード</h1>
      {user ? (
        <>
          <p>ログイン中: {user.email}</p>
          <p>アカウント状態: {status}</p>

          {/* 紹介URL */}
          <div className="card">
            <h2>紹介URL</h2>
            <p>代理店登録用URL</p>
            <input type="text" value={agencyUrl} readOnly />
            <button onClick={() => navigator.clipboard.writeText(agencyUrl)}>コピー</button>
            <p>ユーザー登録用URL</p>
            <input type="text" value={userUrl} readOnly />
            <button onClick={() => navigator.clipboard.writeText(userUrl)}>コピー</button>
          </div>

          {/* 最新の配信 */}
          <div className="card">
            <h2>最新の配信</h2>
            <div className="list">
              <div className="list-item">◯月◯日 - クライアント名様</div>
              <div className="list-item">◯月◯日 - クライアント名様</div>
              <div className="list-item">◯月◯日 - クライアント名様</div>
            </div>
            <p className="scroll-note">※スクロール（最大20件まで）</p>
          </div>

          <div className="register-box">ギフトプランであと◯人登録可能です</div>
        </>
      ) : (
        <p>読み込み中...</p>
      )}
    </div>
  );
}