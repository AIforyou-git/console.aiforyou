"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/authProvider";
import { useRouter } from "next/navigation";

/**
 * 認証 + 権限チェックを行う共通レイアウト
 * 各ダッシュボードで expectedRole を指定して使用
 */
export default function ProtectedLayout({ children, expectedRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // 🔄 user オブジェクト構築中（role 未定義）の可能性があるため保留
    if (!("role" in user)) return;

    if (user.role !== expectedRole) {
      router.push("/error-page?msg=アクセス権限がありません");
    }
  }, [user, loading, expectedRole, router]);

  // 認証状態が確定するまでは何も描画しない
  if (loading || !user || !("role" in user)) return null;

  return <>{children}</>;
}
