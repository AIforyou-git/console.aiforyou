"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "@/app/signup/signup.css";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") || "HQ-ADMIN";

  const handleSignup = async () => {
    setMessage("処理中...");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referredBy: referralCode }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ 登録完了！ 仮パスワードが送信されました`);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage(`❌ 登録失敗: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error.message}`);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1 className="signup-title">ようこそ！</h1>
        <p className="signup-text">新しいアカウントを作成しましょう</p>
        <input
          type="email"
          className="signup-input"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleSignup}
          className="signup-button"
        >
          登録する
        </button>
        <p className="signup-message">{message}</p>
      </div>
    </div>
  );
}
