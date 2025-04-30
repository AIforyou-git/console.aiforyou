
"use client";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabaseClient"; // ← supabaseを直接import！

export default function VerifySessionPage() {

  async function checkSession() {
    const session = (await supabase.auth.getSession()).data.session;

    if (!session) {
      alert("未ログイン状態です。ログインしてください。");
      return;
    }

    const res = await fetch("/api/auth/verify-session-t", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      alert(`認証成功！\nUID: ${data.uid}\nEmail: ${data.email}\nRole: ${data.role}`);
    } else {
      alert(`認証エラー: ${data.message}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">セッション検証テスト</h1>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        onClick={checkSession}
      >
        セッション確認
      </button>
    </div>
  );
}
