"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { firebaseAuth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/lib/authProvider"; // ✅ 追加

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { user, loading } = useAuth(); // ✅ 追加

  // ✅ ログイン済みユーザーは自動でリダイレクト
  useEffect(() => {
    if (loading) return;

    if (user && user.role) {
      const roleRedirects = {
        client: "/client-dashboard",
        agency: "/agency-dashboard",
        user: "/user-dashboard",
        admin: "/admin-dashboard",
        manager: "/manager-dashboard",
      };
      router.push(roleRedirects[user.role] || "/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (!userData || !userData.role) {
        setErrorMessage("❌ ユーザー情報が見つかりません。");
        return;
      }

      const roleRedirects = {
        client: "/client-dashboard",
        agency: "/agency-dashboard",
        user: "/user-dashboard",
        admin: "/admin-dashboard",
        manager: "/manager-dashboard",
      };

      router.push(roleRedirects[userData.role] || "/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMessage("❌ ログインに失敗しました。メールアドレスまたはパスワードを確認してください。");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">ログイン</h1>

        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}

        <div className="space-y-4 text-left">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          onClick={handleLogin}
        >
          メールアドレスでログイン
        </button>

        <p className="mt-4 text-sm">
          <a href="/login/recover" className="text-blue-600 hover:underline">
            パスワードを忘れた方はこちら
          </a>
        </p>
      </div>
    </div>
  );
}
