"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { firebaseAuth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "@/styles/pages/login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      // Firestore から role を取得
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (!userData || !userData.role) {
        setErrorMessage("❌ ユーザー情報が見つかりません。");
        return;
      }

      // ロールに応じてリダイレクト
      const roleRedirects = {
        client: "/client-dashboard",
        agency: "/agency-dashboard",
        user: "/user-dashboard",
        admin: "/admin-dashboard",
        manager: "/manager-dashboard",
      };

      router.push(roleRedirects[userData.role] || "/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMessage("❌ ログインに失敗しました。メールアドレスまたはパスワードを確認してください。");
    }
  };

  return (
    <div className="login">
      <div className="loginContainer">
        <h1>ログイン</h1>
        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="loginButton" onClick={handleLogin}>メールアドレスでログイン</button>

        <p><a href="/login/recover">パスワードを忘れた方はこちら</a></p>
      </div>
    </div>
  );
}
