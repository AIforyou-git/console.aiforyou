"use client";

import Link from "next/link";
import { FileText, MailOpen, Send } from "lucide-react";

export default function Info() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">情報</h1>

      {/* 補助金情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
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
      </div>

      {/* メール配信管理 */}
      <h2 className="text-xl font-bold mb-4 text-gray-700">📩 メール配信管理</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin-dashboard/mail-template"
          className="flex flex-col items-start bg-white shadow-md p-5 rounded-xl hover:bg-gray-50 transition"
        >
          <div className="text-green-600 mb-2">
            <MailOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">テンプレート管理</h3>
          <p className="text-sm text-gray-600">
            メールテンプレートを作成・編集・削除します
          </p>
        </Link>

        <Link
          href="/admin-dashboard/news-send"
          className="flex flex-col items-start bg-white shadow-md p-5 rounded-xl hover:bg-gray-50 transition"
        >
          <div className="text-blue-500 mb-2">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">配信対象の確認</h3>
          <p className="text-sm text-gray-600">
            本日送信予定のクライアントと記事の組み合わせを確認
          </p>
        </Link>

        <Link
          href="/admin-dashboard/news-send/send"
          className="flex flex-col items-start bg-white shadow-md p-5 rounded-xl hover:bg-gray-50 transition"
        >
          <div className="text-red-600 mb-2">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">メール送信を実行</h3>
          <p className="text-sm text-gray-600">
            クライアントにメールを一括送信、または手動で個別送信
          </p>
        </Link>

        {/* ✅ 追加: マッチング一覧への遷移 */}
  <Link
    href="/admin-dashboard/news-match"
    className="flex flex-col items-start bg-white shadow-md p-5 rounded-xl hover:bg-gray-50 transition"
  >
    <div className="text-purple-600 mb-2">
      <Send className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-semibold mb-1">マッチング管理</h3>
    <p className="text-sm text-gray-600">
      フェーズごとのマッチ結果を確認・比較・精査
    </p>
  </Link>
      </div>
    </div>
  );
}
