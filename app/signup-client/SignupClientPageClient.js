"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-300">
        🔄 認証中...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-300 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">📝 AIforyouへようこそ！！</h1>
        <p className="text-gray-600 text-sm">紹介リンクから登録を完了してください</p>
        <p className="text-xs text-gray-400 italic">
          ※こちらは会員様限定のサービスです
        </p>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ✅ 登録する
        </button>
        <p className="text-sm text-red-500">{message}</p>
      </div>
    </div>
  );
}
