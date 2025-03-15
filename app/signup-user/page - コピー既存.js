"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "@/app/signup-user/signup.css";

export default function SignupUser() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

  useEffect(() => {
    if (!referralCode) {
      router.replace("/error?msg=invalid_ref"); // 無効ならエラーページへ
      return;
    }

    // Firestore の `referral` コレクションをチェック
    const checkReferralCode = async () => {
      try {
        const response = await fetch(`/api/auth/check-referral?ref=${referralCode}`);
        const data = await response.json();

        if (!response.ok || !data.valid) {
          router.replace("/error?msg=invalid_ref"); // 存在しなければエラーページへ
        } else {
          setLoading(false); // 正常ならページ表示
        }
      } catch (error) {
        router.replace("/error?msg=server_error");
      }
    };

    checkReferralCode();
  }, [referralCode, router]);

  const handleSignup = async () => {
    setMessage("処理中...");
    try {
      const response = await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referredBy: referralCode }), // 🔥 `referralCode` をそのまま送信
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

  if (loading) {
    return <div className="signup-container">🔄 読み込み中...</div>;
  }

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1 className="signup-title">ようこそ！</h1>
        <p className="signup-text">クライアント登録を完了してください</p>
        <p className="text-xs text-gray-400 absolute top-2 right-2">signup-user</p>
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
