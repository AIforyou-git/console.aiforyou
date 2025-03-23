"use client";

import { useState, useEffect } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, collection } from "firebase/firestore";

export default function InviteClient() {
  const [inviteLink, setInviteLink] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const inviteUrl = `${window.location.origin}/signup-user?ref=HQ-USER-${user.uid}`;
          setInviteLink(inviteUrl);

          // Firestore に `users` の `clientInviteUrl` を更新
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { clientInviteUrl: inviteUrl });

          // Firestore に `referral` を追加
          const referralRef = doc(collection(db, "referral"), `HQ-USER-${user.uid}`);
          await setDoc(referralRef, {
            referralCode: `HQ-USER-${user.uid}`,
            referrerId: user.uid,
            clientInviteUrl: inviteUrl,
            referrerStatus: "active",
            createdAt: new Date(),
          });

          console.log(`✅ Referral created: HQ-USER-${user.uid}`);
        } catch (error) {
          console.error("紹介コード発行エラー:", error);
          setError("紹介コードの発行に失敗しました。");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container">
      <h2 className="page-title">クライアント招待</h2>

      {error && <p className="error-message">{error}</p>}

      {inviteLink && (
        <div className="invite-section">
          <h3>クライアント紹介URL</h3>
          <input type="text" value={inviteLink} readOnly />
          <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="copy-btn">
            コピー
          </button>
        </div>
      )}
    </div>
  );
}
