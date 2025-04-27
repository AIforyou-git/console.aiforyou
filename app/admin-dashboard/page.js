"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState("");

  // 🔥 修正版：ISO8601形式で日本時間を返す
  const getJapanTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 9);
    return now.toISOString();
  };

  useEffect(() => {
    const updateUserInfo = async () => {
      if (!user || !user.id || user.role !== "admin") return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      const now = getJapanTime();

      if (error && error.code === "PGRST116") {
        await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          role: "admin",
          status: "active",
          referredBy: null,
          createdAt: now,
          last_login: now,
        });
        setStatus("active");
      } else if (data) {
        if (data.status === "pending") {
          await supabase
            .from("users")
            .update({ status: "active", last_login: now })
            .eq("id", user.id);
          setStatus("active");
        } else {
          await supabase
            .from("users")
            .update({ last_login: now })
            .eq("id", user.id);
          setStatus(data.status || "active");
        }
      }
    };

    updateUserInfo();
  }, [user]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      alert("ログアウトしました！");
    } catch (err) {
      if (err instanceof Error) {
        alert("ログアウトに失敗しました: " + err.message);
      } else {
        alert("ログアウトに失敗しました。");
      }
    }
  };

  if (loading) {
    return <div className="p-6">読み込み中...</div>;
  }

  if (!user || user.role !== "admin") {
    return <div className="p-6 text-red-500">アクセス権がありません。</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">管理者ダッシュボード</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">ログイン中:</span> {user.email}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">ステータス:</span> {status}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin-dashboard/users">
          <Button variant="secondary" className="w-full">
            👥 ユーザー管理
          </Button>
        </Link>

        <Link href="/admin-dashboard/invite">
          <Button variant="secondary" className="w-full">
            🔗 紹介URLの送信
          </Button>
        </Link>

        <Link href="/admin-dashboard/account">
          <Button variant="secondary" className="w-full">
            ⚙️ アカウント設定
          </Button>
        </Link>

        <Button onClick={handleLogout} variant="destructive" className="w-full">
          🚪 ログアウト
        </Button>
      </div>
    </div>
  );
}
