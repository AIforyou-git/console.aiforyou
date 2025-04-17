"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    });

    return () => unsubscribe();
  }, []);

  const updateRole = async (uid, newRole) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role: newRole });
  };

  const deleteUser = async (uid) => {
    const confirmDelete = window.confirm("本当にこのユーザーを削除しますか？");
    if (confirmDelete) {
      await deleteDoc(doc(db, "users", uid));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Link href="/admin-dashboard/users/create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            ➕ 新規ユーザー登録
          </button>
        </Link>

        <Link href="/admin-dashboard">
          <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
            ← ダッシュボードに戻る
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-white border rounded shadow-md">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-700">
              <th className="px-4 py-2 text-left">UID</th>
              <th className="px-4 py-2 text-left">メールアドレス</th>
              <th className="px-4 py-2 text-left">ロール</th>
              <th className="px-4 py-2 text-left">紹介元</th>
              <th className="px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t text-sm">
                <td className="px-4 py-2 text-gray-600 truncate max-w-[150px]">{user.id}</td>
                <td className="px-4 py-2 text-gray-800">
                  {user.email
                    ? user.email.replace(/(.{3}).*?(@.*)/, "$1****")
                    : "―"}
                </td>
                <td className="px-4 py-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="admin">Admin</option>
                    <option value="agency">代理店</option>
                    <option value="user">ユーザー</option>
                    <option value="client">クライアント</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-gray-700">{user.referredBy || "なし"}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:underline"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
