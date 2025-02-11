"use client"; 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase";
import "@/styles/pages/login.css"; 

import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // ✅ 修正後もエラーメッセージを使う

  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMessage("❌ ログインに失敗しました。メールアドレスまたはパスワードを確認してください。"); // ✅ 修正！
    }
  };

  return (
    <div className="login">
      <div className="loginContainer">
        <h1>ログイン</h1>
        {errorMessage && <p className="error-text">{errorMessage}</p>}  {/* ✅ エラーメッセージを表示！ */}
        <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>ログイン</button>
      </div>
    </div>
  );
}
