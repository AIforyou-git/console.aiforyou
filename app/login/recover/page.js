"use client";

import { useState } from "react";
import { getAuth, sendSignInLinkToEmail, sendPasswordResetEmail } from "firebase/auth";
import "@/styles/pages/login.css"; // ✅ login.css を適用

export default function RecoverPage() {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // ✅ メールリンクを送信
  const handleEmailLinkLogin = async () => {
    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      setMessage("✅ 認証リンクを送信しました。メールを確認してください。");
    } catch (error) {
      setMessage("❌ メール送信エラー: " + error.message);
    }
  };

  // ✅ パスワードリセットを送信
  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ パスワードリセットのメールを送信しました。");
    } catch (error) {
      setMessage("❌ パスワードリセットエラー: " + error.message);
    }
  };

  return (
    <div className="login">
      <div className="loginContainer">
        <h2>アカウント復旧</h2>
        <p>メールアドレスを入力し、ログイン方法を選んでください。</p>

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="loginButton" onClick={handleEmailLinkLogin}>メールリンクを送る</button>
        <button className="loginButton secondaryButton" onClick={handlePasswordReset}>パスワードを再設定する</button>

        {message && <p className="infoText">{message}</p>}

        <a href="/login" className="forgotPassword">ログイン画面へ戻る</a>
      </div>
    </div>
  );
}
