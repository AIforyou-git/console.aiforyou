"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function AdminDashboard() {
  const [adminId, setAdminId] = useState(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const auth = getAuth();

  const getJapanTime = () => {
    return new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAdminId(user.uid);
        setEmail(user.email);

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            role: "admin",
            status: "active",
            referredBy: null,
            createdAt: getJapanTime(),
            lastLogin: getJapanTime(),
          });
          setStatus("active");
        } else {
          const userData = userSnap.data();
          setStatus(userData.status);

          if (userData.status === "pending") {
            await updateDoc(userRef, {
              status: "active",
              lastLogin: getJapanTime(),
            });
            setStatus("active");
          } else {
            await updateDoc(userRef, { lastLogin: getJapanTime() });
          }
        }
      } else {
        setAdminId(null);
        setEmail("");
        setStatus("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAdminId(null);
      setEmail("");
      alert("ログアウトしました！");
    } catch (error) {
      alert("ログアウトに失敗しました: " + error.message);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>管理者ダッシュボード</h1>

      {/* 🔹 ログイン情報表示 */}
      <p>ログイン中: {email}</p>
      <p>ステータス: {status}</p>

      {/* 🔹 ナビゲーションボタン */}
      <div style={{ marginTop: "20px" }}>
        <Link href="/admin-dashboard/users">
          <button>👥 ユーザー管理</button>
        </Link>

        <Link href="/admin-dashboard/invite">
          <button>🔗 紹介URLの作成</button>
        </Link>

        <Link href="/admin-dashboard/account">
          <button>⚙️ アカウント設定</button>
        </Link>

        <button onClick={handleLogout}>🚪 ログアウト</button>
      </div>
    </div>
  );
}
