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
    <div className="user-management">
      <h1>ユーザー管理</h1>

      {/* 🔹 新規ユーザー登録ボタンを追加 */}
      <Link href="/admin-dashboard/users/create">
        <button>新規ユーザー登録</button>
      </Link>

      {/* 🔹 ダッシュボードに戻るリンク */}
      <Link href="/admin-dashboard">
        <button>ダッシュボードに戻る</button>
      </Link>

      <table>
        <thead>
          <tr>
            <th>UID</th>
            <th>Email</th>
            <th>Role</th>
            <th>紹介元（referredBy）</th>
            <th>削除</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>
                <select value={user.role} onChange={(e) => updateRole(user.id, e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="agency">代理店</option>
                  <option value="user">ユーザー</option>
                  <option value="client">クライアント</option>
                </select>
              </td>
              <td>{user.referredBy || "なし"}</td>
              <td>
                <button onClick={() => deleteUser(user.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
