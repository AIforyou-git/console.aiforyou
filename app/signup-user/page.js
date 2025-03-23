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
      router.replace("/error-page?msg=invalid_ref");
      return;
    }

    setReferralCode(ref);

    // Firestore の `referral` コレクションをチェック
    const checkReferralCode = async () => {
      try {
        console.log(`🔍 紹介コードチェック開始: ${ref}`);
        const response = await fetch(`/api/auth/check-referral?ref=${ref}`);
        const data = await response.json();

        console.log("📩 紹介コード API レスポンス:", data);

        if (!response.ok || !data.valid) {
          console.error("❌ 無効な紹介コード:", ref);
          router.replace("/error-page?msg=invalid_ref"); // 🔥 存在しなければエラーページへ
        } else {
          console.log("✅ 紹介コード有効:", ref);
          setLoading(false); // ✅ 認証成功ならページ表示
        }
      } catch (error) {
        console.error("❌ 紹介コード API エラー:", error);
        router.replace("/error-page?msg=server_error");
      }
    };

    checkReferralCode();
  }, [router]);

  const handleSignup = async () => {
    setMessage("処理中...");
    console.log("🚀 ユーザー登録開始:", { email, referralCode });

    try {
      // 🔥 Firebase へのユーザー登録
      const response = await fetch("/api/auth/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, referredBy: referralCode }), // ✅ `referralCode` を利用
      });

      const data = await response.json();
      console.log("📩 ユーザー登録 API レスポンス:", data);

      if (!response.ok) {
        console.error("❌ ユーザー登録失敗:", data.error);
        setMessage(`❌ 登録失敗: ${data.error}`);
        return;
      }

      console.log("✅ ユーザー登録成功！ Firebase に記録済み。次にメール送信を実行...");

      // 🔥 メール送信 API のリクエスト開始
      const emailResponse = await fetch("/api/auth/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tempPassword: data.tempPassword }),
      });

      const emailData = await emailResponse.json();
      console.log("📩 メール送信 API レスポンス:", emailData);

      if (!emailResponse.ok) {
        console.error("❌ メール送信失敗:", emailData.error);
        setMessage(`❌ メール送信失敗: ${emailData.error}`);
        return;
      }

      console.log("✅ メール送信成功！");

      setMessage("✅ 登録完了！ 仮パスワードが送信されました");
      setTimeout(() => router.push("/login"), 2000);

    } catch (error) {
      console.error("❌ API リクエストエラー:", error);
      setMessage(`❌ エラー: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="signup-container">🔄 読み込み中...</div>;
  }

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1 className="signup-title">AIforyouへようこそ！</h1>
        <p className="signup-text">クライアント登録を完了してください</p>
        <p className="text-xs text-gray-400 absolute top-2 right-2">signup-user</p>
        <p className="signup-referral hidden">ユーザー登録紹介コード: {referralCode}</p>
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
