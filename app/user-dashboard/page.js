"use client";

import { useEffect, useState } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
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
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">ユーザーダッシュボード</h1>

      {user ? (
        <>
          <p className="mb-2">ログイン中: {user.email}</p>
          <p className="mb-4">アカウント状態: {status}</p>

          <div className="mb-6">
            <Link href="/user-dashboard/clients">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                📋 登録一覧
              </button>
            </Link>
          </div>

          {/* 最新の配信 */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">
              <i className="fas fa-envelope mr-2"></i>最新の配信
            </h2>
            <div className="space-y-2">
              <div>◯月◯日 - クライアント名様</div>
              <div>◯月◯日 - クライアント名様</div>
              <div>◯月◯日 - クライアント名様</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">※スクロール（最大20件まで）</p>
          </div>

          {/* 配信された情報 */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">
              <i className="fas fa-bullhorn mr-2"></i>配信された情報
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>◯月◯日 - ◯◯に関する補助金</span>
                <Link href="#">
                  <i className="fas fa-external-link-alt text-blue-600 hover:text-blue-800"></i>
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <span>◯月◯日 - ◯◯に関する補助金</span>
                <Link href="#">
                  <i className="fas fa-external-link-alt text-blue-600 hover:text-blue-800"></i>
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <span>◯月◯日 - ◯◯に関する融資</span>
                <Link href="#">
                  <i className="fas fa-external-link-alt text-blue-600 hover:text-blue-800"></i>
                </Link>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">※スクロール（直近最大20件まで）</p>
          </div>

          {/* 登録可能人数 */}
          <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded text-sm font-medium">
            ギフトプランであと◯人登録可能です
          </div>
        </>
      ) : (
        <p>読み込み中...</p>
      )}
    </div>
  );
}
