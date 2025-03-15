"use client";

import { useEffect, useState } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import "@/styles/pages/dashboard.css";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login"); // 🔥 未ログインならログインページへ
        return;
      }

      setUser(currentUser);

      // 🔥 Firestore からユーザーのステータスを取得
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setStatus(userData.status);

        // 🔥 `status: "pending"` の場合は `active` に更新
        if (userData.status === "pending") {
          await updateDoc(userDocRef, { status: "active", lastLogin: new Date().toISOString() });
          setStatus("active");
        } else {
          // 🔥 lastLogin のみ更新
          await updateDoc(userDocRef, { lastLogin: new Date().toISOString() });
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="container">
      <h1>ユーザーダッシュボード</h1>

      {user ? (
        <>
          <p>ログイン中: {user.email}</p>
          <p>アカウント状態: {status}</p>

          {/* 最新の配信 */}
          <div className="card">
            <h2><i className="fas fa-envelope"></i> 最新の配信</h2>
            <div className="list">
              <div className="list-item">◯月◯日 - クライアント名様</div>
              <div className="list-item">◯月◯日 - クライアント名様</div>
              <div className="list-item">◯月◯日 - クライアント名様</div>
            </div>
            <p className="scroll-note">※スクロール（最大20件まで）</p>
          </div>

          {/* 配信された情報 */}
          <div className="card">
            <h2><i className="fas fa-bullhorn"></i> 配信された情報</h2>
            <div className="list">
              <div className="list-item">
                <span>◯月◯日 - ◯◯に関する補助金</span>
                <Link href="#"><i className="fas fa-external-link-alt"></i></Link>
              </div>
              <div className="list-item">
                <span>◯月◯日 - ◯◯に関する補助金</span>
                <Link href="#"><i className="fas fa-external-link-alt"></i></Link>
              </div>
              <div className="list-item">
                <span>◯月◯日 - ◯◯に関する融資</span>
                <Link href="#"><i className="fas fa-external-link-alt"></i></Link>
              </div>
            </div>
            <p className="scroll-note">※スクロール（直近最大20件まで）</p>
          </div>

          {/* 登録可能人数 */}
          <div className="register-box">
            ギフトプランであと◯人登録可能です
          </div>
        </>
      ) : (
        <p>読み込み中...</p>
      )}
    </div>
  );
}
