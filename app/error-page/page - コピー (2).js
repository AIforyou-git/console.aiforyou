"use client";
export const dynamic = "force-dynamic"; // ← 追加

import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const msg = searchParams.get("msg") || "Unknown error";

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>❌ エラーが発生しました</h1>
      <p>理由: {msg}</p>
      <a href="/" style={{ color: "blue", textDecoration: "underline" }}>ホームに戻る</a>
    </div>
  );
}
