"use client";

import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function RecoverPage() {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ パスワードリセットのメールを送信しました。");
    } catch (error) {
      setMessage("❌ パスワードリセットエラー: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">アカウント復旧</h2>
        <p className="text-gray-600">メールアドレスを入力し、パスワードを再設定してください。</p>

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
        />

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          onClick={handlePasswordReset}
        >
          🔒 パスワードを再設定する
        </button>

        {message && <p className="text-sm text-red-500 mt-2">{message}</p>}

        <a href="/login" className="text-blue-600 text-sm underline block mt-4">
          ログイン画面へ戻る
        </a>
      </div>
    </div>
  );
}
