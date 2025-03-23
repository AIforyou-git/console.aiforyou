"use client";

import { useState, useEffect } from "react";
import { getClientsByUser } from "@/services/firestoreService";
import { firebaseAuth } from "@/lib/firebase";  
import ClientEditModal from "@/components/ClientEditModal";
import "@/styles/pages/customer.css";

export default function CustomerList() {
  const [clients, setClients] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // 🔥 Firebase Authentication から現在のユーザーを取得
        const currentUser = firebaseAuth.currentUser;

        if (!currentUser) {
          console.error("🔥 ユーザーが認証されていません");
          return;
        }

        const uid = currentUser.uid;
        setUserId(uid);  // UID を state に保存

        // 🔥 UID を使ってクライアント情報を取得
        const clientData = await getClientsByUser(uid);
        setClients(clientData);
      } catch (error) {
        console.error("顧客情報の取得に失敗しました", error);
      }
    };

    fetchClients();
  }, []);

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  return (
    <div className="customer-list-container">
      <h2>顧客一覧</h2>
      <table className="customer-table">
        <thead>
          <tr>
            <th>登録日時</th>
            <th>UID</th>
            <th>メールアドレス</th>
            <th>会社名</th>  
            <th>編集</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.createdAt ? new Date(client.createdAt.seconds * 1000).toLocaleString() : "-"}</td>
              <td>{client.id}</td>
              <td>{client.email}</td>
              <td>{client.company || "-"}</td>
              <td>
                <button className="btn btn-edit" onClick={() => handleEditClick(client)}>
                  編集
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <ClientEditModal
          client={selectedClient}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
