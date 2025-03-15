"use client";

import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreateUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const router = useRouter();
  const auth = getAuth();

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // 🔹 Firestore に同じメールのユーザーがいるかチェック
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        alert("このメールアドレスはすでに登録されています。");
        return;
      }

      // 🔹 Firebase Authentication に新規ユーザーを作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔹 Firestore の `users` コレクションにデータを追加
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        role: role,
        referredBy: auth.currentUser?.uid || null, // 管理者の UID を記録
        createdAt: new Date()
      });

      alert("ユーザー登録が完了しました！");
      router.push("/admin-dashboard/users"); // 登録後にユーザー一覧へ戻る
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("このメールアドレスはすでに登録されています。");
      } else {
        alert("ユーザー登録に失敗しました: " + error.message);
      }
    }
  };

  return (
    <div className="create-user">
      <h1>新規ユーザー登録</h1>
      <form onSubmit={handleCreateUser}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>パスワード:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <label>権限 (Role):</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="agency">代理店</option>
          <option value="user">ユーザー</option>
          <option value="client">クライアント</option>
        </select>

        <button type="submit">ユーザー登録</button>
      </form>
    </div>
  );
}
