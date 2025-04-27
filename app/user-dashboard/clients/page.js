"use client";

import { useEffect, useState } from "react";
// TODO: Firebase廃止予定、一時コメントアウト
//import { getAuth, onAuthStateChanged } from "firebase/auth";
//import { db } from "@/lib/firebase";
//import { collection, query, where, getDocs } from "firebase/firestore";

export default function ClientList() {
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

  return (
    <div className="client-list">
      <h1>📋 紹介したクライアント一覧</h1>
      {loading ? (
        <p>読み込み中...</p>
      ) : clients.length === 0 ? (
        <p>紹介されたクライアントがまだ存在しません。</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2", borderBottom: "2px solid #ccc" }}>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>メールアドレス</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>登録日時</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>UID</th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>ステータス</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{client.email}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                  {client.createdAt && client.createdAt.seconds
                    ? new Date(client.createdAt.seconds * 1000).toLocaleString("ja-JP")
                    : "-"}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{client.uid || client.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{client.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
