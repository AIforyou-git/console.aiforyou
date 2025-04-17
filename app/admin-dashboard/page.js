"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";

import Button from "@/components/ui/Button";

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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">管理者ダッシュボード</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">ログイン中:</span> {email}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">ステータス:</span> {status}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin-dashboard/users">
          <Button variant="secondary" className="w-full">👥 ユーザー管理</Button>
        </Link>

        <Link href="/admin-dashboard/invite">
          <Button variant="secondary" className="w-full">🔗 紹介URLの作成</Button>
        </Link>

        <Link href="/admin-dashboard/account">
          <Button variant="secondary" className="w-full">⚙️ アカウント設定</Button>
        </Link>

        <Button onClick={handleLogout} variant="destructive" className="w-full">🚪 ログアウト</Button>
      </div>
    </div>
  );
}
