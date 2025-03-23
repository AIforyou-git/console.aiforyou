"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "@/app/signup/signup.css";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState("HQ-ADMIN"); // 初期値をセット

  // ✅ `useEffect` で `referralCode` を取得 & バリデーション
  useEffect(() => {
    const ref = searchParams.get("ref") || "HQ-ADMIN";
    const validCodes = ["HQ-AGENCY", "HQ-USER", "HQ-CLIENT", "HQ-ADMIN"];

    // 🔍 バリデーション（固定紹介コードに含まれているか）
    if (!validCodes.includes(ref)) {
      console.error("❌ 無効な紹介コード:", ref);
      router.replace("/error-page?msg=invalid_ref"); // 🚫 無効ならエラーページへ
      return;
    }

    setReferralCode(ref);
    console.log("🔍 Referral Code Updated:", ref); // デバッグ用
  }, [searchParams]);

  const handleSignup = async () => {
    setMessage("処理中...");
    console.log("🚀 Signup process started with email:", email);
    console.log("📌 Referral Code:", referralCode);
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referredBy: referralCode }),
      });
      
      console.log("📨 API Request Sent: /api/auth/register", { email, referredBy: referralCode });
      
      const data = await response.json();
      console.log("🔍 API Response Received:", data);
      
      if (response.ok) {
        setMessage("✅ 登録完了！ 仮パスワードが送信されました");
        console.log("✅ Signup Successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage(`❌ 登録失敗: ${data.error}`);
        console.error("❌ Signup Failed:", data.error);
      }
    } catch (error) {
      setMessage(`❌ エラー: ${error.message}`);
      console.error("❌ API Request Error:", error);
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
        <button onClick={handleSignup} className="signup-button">
          登録する
        </button>
        <p className="signup-message">{message}</p>

        {/* ✅ 管理者専用ボタン（元の判定を維持） */}
        {referralCode === "HQ-ADMIN" && (
          <button className="admin-button">管理者専用</button>
        )}
      </div>
    </div>
  );
}
