"use client";

import { useState, useEffect } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import "@/styles/pages/customerslist.css";

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        const clientsRef = collection(db, "users", user.uid, "clients");
        const clientsSnapshot = await getDocs(clientsRef);
        setCustomers(clientsSnapshot.docs.map(doc => doc.data()));
      }
    });
    return () => unsubscribe();
  }, []);

  // 検索フィルター
  const filteredCustomers = customers.filter(customer =>
    customer.name.includes(searchTerm) || customer.company.includes(searchTerm)
  );

  // ページネーション
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container">
      <h2 className="page-title">紹介したクライアント一覧</h2>
      <div className="search-box">
        <input
          type="text"
          placeholder="顧客名または会社名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>名前</th>
              <th>会社名</th>
              <th>メールアドレス</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((customer, index) => (
              <tr key={index}>
                <td>{customer.name}</td>
                <td>{customer.company}</td>
                <td>{customer.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}
