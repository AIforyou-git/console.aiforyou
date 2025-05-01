// components/Footer/FooterAdmin.js
"use client";

import Link from "next/link";

export default function FooterAdmin() {
  return (
    <footer className="bg-gray-100 border-t text-sm text-center text-gray-600 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="space-x-4">
          <Link href="/admin/terms">管理者規約</Link>
          <Link href="/admin/support">管理者サポート</Link>
          <Link href="/contact">お問い合わせ</Link>
        </div>
        <div className="text-xs text-gray-500">管理パネル</div>
      </div>
      <div className="py-1 text-xs text-gray-400">© 2025 AIforyou Admin</div>
    </footer>
  );
}