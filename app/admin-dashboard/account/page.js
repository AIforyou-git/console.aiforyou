"use client";

import { useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  updateEmail,
  sendPasswordResetEmail,
} from "firebase/auth";
import Link from "next/link";

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
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">⚙️ アカウント設定</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">📧 メールアドレスの変更</label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
          />
          <button
            onClick={handleEmailChange}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            変更する
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">🔑 パスワードリセット</label>
        <button
          onClick={handlePasswordReset}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          リセットメールを送信
        </button>
      </div>

      {message && (
        <p className="text-sm text-green-700 font-medium mt-4">{message}</p>
      )}

      {/* 戻るボタン */}
      <div className="mt-8">
        <Link href="/admin-dashboard">
          <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
            ← ダッシュボードに戻る
          </button>
        </Link>
      </div>
    </div>
  );
}
