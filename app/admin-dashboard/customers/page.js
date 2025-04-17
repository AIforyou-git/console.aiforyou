"use client";

import { useState, useEffect } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

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
    customer.name?.includes(searchTerm) || customer.company?.includes(searchTerm)
  );

  // ページネーション
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">紹介したクライアント一覧</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="顧客名または会社名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-md overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-700">
              <th className="px-4 py-2">名前</th>
              <th className="px-4 py-2">会社名</th>
              <th className="px-4 py-2">メールアドレス</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((customer, index) => (
              <tr key={index} className="border-t text-sm">
                <td className="px-4 py-2">{customer.name || "未登録"}</td>
                <td className="px-4 py-2">{customer.company || "―"}</td>
                <td className="px-4 py-2 text-gray-600 truncate max-w-[200px]">
                  {customer.email
                    ? customer.email.replace(/(.{3}).*?(@.*)/, "$1****")
                    : "―"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 text-sm border rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
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
