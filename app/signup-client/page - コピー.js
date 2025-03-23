"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "./signup.css";

export default function SignupClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState(null);

  useEffect(() => {
    if (!refCode) {
      router.replace("/error-page?msg=invalid_ref");
      return;
    }

    setReferralCode(refCode);

    const checkReferralCode = async () => {
      try {
        const res = await fetch(`/api/auth/check-referral?ref=${refCode}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          router.replace("/error-page?msg=invalid_ref");
        } else {
          setLoading(false);
        }
      } catch (err) {
        router.replace("/error-page?msg=server_error");
      }
    };

    checkReferralCode();
  }, [refCode, router]);

  const handleSignup = async () => {
    setMessage("処理中...");

    try {
      const res = await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referredBy: referralCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(`❌ 登録エラー: ${data.error}`);
        return;
      }

      const emailRes = await fetch("/api/auth/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tempPassword: data.tempPassword }),
      });

      const emailData = await emailRes.json();
      if (!emailRes.ok) {
        setMessage(`❌ メール送信エラー: ${emailData.error}`);
        return;
      }

      setMessage("✅ 登録完了！仮パスワードを送信しました");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setMessage(`❌ エラー: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="signup-container">🔄 認証中...</div>;
  }

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1 className="signup-title">📝 AIforyouへようこそ！！</h1>
        <p className="signup-text">紹介リンクから登録を完了してください</p>
        <p className="signup-referral hidden">※こちらは会員様限定のサービスです。{/*紹介コード: {referralCode}*/}</p>
        <input
          type="email"
          className="signup-input"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleSignup} className="signup-button">
          ✅ 登録する
        </button>
        <p className="signup-message">{message}</p>
      </div>
    </div>
  );
}
