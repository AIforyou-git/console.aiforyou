"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Button from "@/components/ui/Button"; // ✅ default import に修正（構文エラー解消）

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const accessToken = searchParams.get("access_token");

  const handleReset = async () => {
    if (!accessToken || !password) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (error) {
      setMessage("エラーが発生しました。再度お試しください。");
    } else {
      setMessage("パスワードが正常に更新されました。ログインページに移動します。");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-semibold mb-4">パスワード再設定</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="新しいパスワード"
        className="border p-2 mb-4 rounded w-full max-w-sm"
      />
      <Button onClick={handleReset} disabled={loading || !accessToken}>
        {loading ? "更新中..." : "パスワードを更新する"}
      </Button>
      {message && <p className="mt-4 text-sm text-center text-red-500">{message}</p>}
    </div>
  );
}
