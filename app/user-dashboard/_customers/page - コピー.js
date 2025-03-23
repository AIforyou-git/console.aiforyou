"use client";

import { useState, useEffect } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import "@/styles/pages/customerslist.css";

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          setLoading(true);
          const customersRef = collection(db, "clients");
          const customersQuery = query(
            customersRef,
            where("referredBy", "==", user.uid) // 自分が紹介したクライアントのみ取得
          );
          const customersSnapshot = await getDocs(customersQuery);
          setCustomers(customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("クライアントデータの取得エラー:", error);
          setError("顧客データの取得に失敗しました。");
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔍 検索フィルター
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📌 ページネーション処理
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container">
      <h2 className="page-title">顧客一覧</h2> {/* 🔥 ヘッダーのタイトルと統一 */}

      {/* 🔍 検索フィールド */}
      <div className="search-box">
        <input
          type="text"
          placeholder="顧客名または会社名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 🕛 ローディング表示 */}
      {loading && <p className="loading-message">データを読み込み中...</p>}

      {/* ⚠️ エラーメッセージ */}
      {error && <p className="error-message">{error}</p>}

      {/* 📋 クライアントリスト */}
      {!loading && !error && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>名前</th>
                <th>会社名</th>
                <th>メールアドレス</th>
                <th>詳細</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer, index) => (
                  <tr key={index}>
                    <td>{customer.name}</td>
                    <td>{customer.company}</td>
                    <td>{customer.email}</td>
                    <td>
                      <a href={`/user-dashboard/customers/edit/${customer.id}`} className="details-link">編集</a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">該当する顧客が見つかりません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 📌 ページネーション */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`page-button ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
