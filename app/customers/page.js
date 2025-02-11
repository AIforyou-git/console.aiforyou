"use client";

import { useState } from "react";
import "@/styles/pages/customerslist.css";

export default function CustomersList() {
  // ダミーデータ（100件）
  const dummyCustomers = Array.from({ length: 100 }, (_, i) => ({
    name: `顧客${i + 1}`,
    company: `会社${i + 1}`,
    email: `customer${i + 1}@example.com`
  }));

  // UI用の状態
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // ページネーション処理
  const totalPages = Math.ceil(dummyCustomers.length / itemsPerPage);
  const displayedCustomers = dummyCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container">
      <h2>顧客一覧</h2>

      {/* 🔍 検索ボックス（UIのみ） */}
      <div className="search-box">
        <input
          type="text"
          placeholder="顧客名または会社名で検索..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <i className="fas fa-search"></i>
      </div>

      {/* 📋 顧客リスト */}
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
            {displayedCustomers.map((customer, index) => (
              <tr key={index}>
                <td>{customer.name}</td>
                <td>{customer.company}</td>
                <td>{customer.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📌 ページネーション（UIのみ） */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
