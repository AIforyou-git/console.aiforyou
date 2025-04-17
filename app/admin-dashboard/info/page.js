"use client";

import Link from "next/link";
import { FileText, MailOpen } from "lucide-react";

export default function Info() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">情報</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 補助金情報 */}
        <Link
          href="/admin-dashboard/news-control"
          className="flex flex-col items-start bg-white shadow-md p-5 rounded-xl hover:bg-gray-50 transition"
        >
          <div className="text-blue-600 mb-2">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">補助金情報</h3>
          <p className="text-sm text-gray-600">
            管理クライアントに該当する補助金一覧をまとめて確認
          </p>
        </Link>

        {/* メール管理 */}
        <Link
          href="/preparing"
          className="flex flex-col items-start bg-white shadow-md p-5 rounded-xl hover:bg-gray-50 transition"
        >
          <div className="text-green-600 mb-2">
            <MailOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">メール管理</h3>
          <p className="text-sm text-gray-600">
            クライアントへ送信したメールの履歴を一括管理
          </p>
        </Link>
      </div>
    </div>
  );
}
