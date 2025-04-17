"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function ClientReferredList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "client"),
          where("referredBy", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(data);
      } catch (error) {
        console.error("❌ クライアント取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [currentUser]);

  // メールアドレスを部分的にマスク
  const maskEmail = (email) => {
    if (!email) return "-";
    const atIndex = email.indexOf("@");
    const local = atIndex > 0 ? email.slice(0, atIndex) : email;
    if (local.length <= 6) return local[0] + "****"; // 短すぎる場合
  
    const prefix = local.slice(0, 3);
    const suffix = local.slice(-4);
    return `${prefix}****${suffix}`;
  };
  

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 紹介したクライアント一覧</h1>

        {loading ? (
          <p className="text-gray-600">読み込み中...</p>
        ) : clients.length === 0 ? (
          <p className="text-gray-600">紹介されたクライアントがまだ存在しません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border">名前</th>
                  <th className="px-3 py-2 border">メール</th>
                  <th className="px-3 py-2 border">登録日時</th>
                  <th className="px-3 py-2 border">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 border">
                      {client.name?.trim() || "未登録"}
                    </td>
                    <td className="px-3 py-2 border">
                      {maskEmail(client.email)}
                    </td>
                    <td className="px-3 py-2 border">
                      {client.createdAt?.seconds
                        ? new Date(client.createdAt.seconds * 1000).toLocaleString("ja-JP")
                        : "-"}
                    </td>
                    <td className="px-3 py-2 border">{client.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <Link href="/client-dashboard/invite">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
              🔙 戻る
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
