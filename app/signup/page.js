"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [referralCode, setReferralCode] = useState("HQ-ADMIN");

  useEffect(() => {
    const ref = searchParams.get("ref") || "HQ-ADMIN";
    const validCodes = ["HQ-AGENCY", "HQ-USER", "HQ-CLIENT", "HQ-ADMIN"];

    if (!validCodes.includes(ref)) {
      console.error("❌ 無効な紹介コード:", ref);
      router.replace("/error-page?msg=invalid_ref");
      return;
    }

    setReferralCode(ref);
  }, [searchParams]);

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
        setMessage("✅ 登録完了！ 仮パスワードが送信されました");
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 to-purple-400 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ようこそ！</h1>
        <p className="text-gray-600 mb-4">新しいアカウントを作成しましょう</p>

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-blue-500 text-white py-2 mt-2 rounded-lg hover:bg-blue-600 transition"
        >
          登録する
        </button>

        <p className="text-sm text-gray-600 mt-4">{message}</p>

        {referralCode === "HQ-ADMIN" && (
          <button className="mt-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
            管理者専用
          </button>
        )}
      </div>
    </div>
  );
}
