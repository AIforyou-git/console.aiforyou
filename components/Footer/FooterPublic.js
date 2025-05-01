// components/Footer/FooterPublic.js
"use client";

import Link from "next/link";
import { useAuth } from "@/lib/authProvider";

export default function FooterPublic() {
  const { user } = useAuth();

  return (
    <footer className="bg-gray-100 border-t text-sm text-center text-gray-600 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="space-x-4">
          <Link href="/legal/terms">利用規約</Link>
          <Link href="/legal/privacy">プライバシーポリシー</Link>
          <Link href="/legal/tokusho">特定商取引法</Link>
          <Link href="/contact">お問い合わせ</Link>
        </div>
        {user?.email && (
          <div className="text-xs text-gray-500">ログイン中: {user.email}</div>
        )}
      </div>
      <div className="py-1 text-xs text-gray-400">© 2025 AIforyou Inc.</div>
    </footer>
  );
}