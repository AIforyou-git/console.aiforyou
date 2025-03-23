"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, updateEmail, sendPasswordResetEmail } from "firebase/auth";

export default function AccountSettings() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setEmail(user.email || "");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEmailChange = async () => {
    try {
      await updateEmail(auth.currentUser, email);
      setMessage("✅ メールアドレスを変更しました");
    } catch (error) {
      setMessage(`❌ エラー: ${error.message}`);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ パスワードリセットメールを送信しました");
    } catch (error) {
      setMessage(`❌ エラー: ${error.message}`);
    }
  };

  return (
    <div className="account-settings">
      <h1>⚙️ アカウント設定</h1>

      <div style={{ marginTop: "20px" }}>
        <label>メールアドレスの変更</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleEmailChange}>変更する</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>パスワードリセット</label>
        <button onClick={handlePasswordReset}>リセットメールを送信</button>
      </div>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}
