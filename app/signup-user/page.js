"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./signup.css"; // ✅ 相対パスで CSS 読み込み

export default function SignupUser() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return; // 🔥 `SSR` では何もしない

    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref") || "HQ-USER";

    if (!ref) {
      router.replace("/error?msg=invalid_ref");
      return;
    }

    setReferralCode(ref);

    // Firestore の `referral` コレクションをチェック
    const checkReferralCode = async () => {
      try {
        const response = await fetch(`/api/auth/check-referral?ref=${ref}`);
        const data = await response.json();

        if (!response.ok || !data.valid) {
          router.replace("/error?msg=invalid_ref"); // 🔥 存在しなければエラーページへ
        } else {
          setLoading(false); // ✅ 認証成功ならページ表示
        }
      } catch (error) {
        router.replace("/error?msg=server_error");
      }
    };

    checkReferralCode();
  }, [router]);

  const handleSignup = async () => {
    setMessage("処理中...");
    try {
      const response = await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referredBy: referralCode }), // ✅ `referralCode` を利用
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
        <h1 className="signup-title">ユーザー登録</h1>
        <p className="signup-text">クライアント登録を完了してください</p>
        <p className="text-xs text-gray-400 absolute top-2 right-2">signup-user</p>
        <p className="signup-referral">ユーザー登録紹介コード: {referralCode}</p>
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
      </div>
    </div>
  );
}
