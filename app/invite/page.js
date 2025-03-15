"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InvitePage({ params }) {
  const router = useRouter();
  const { role } = params;

  useEffect(() => {
    if (role === "agency" || role === "user" || role === "client") {
      router.push(`/signup?role=${role}`); // 🔥 役割ごとの登録ページへリダイレクト
    } else {
      router.push("/404"); // ❌ 不正なURLなら404へ
    }
  }, [role, router]);

  return <p>リダイレクト中...</p>;
}
