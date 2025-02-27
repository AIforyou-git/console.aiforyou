"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import "@/styles/pages/login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  // メール・パスワードでログイン
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      router.push("/dashboard");
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

        <a href="#" className="forgotPassword">パスワードを忘れた方はこちら</a>
      </div>
    </div>
  );
}
