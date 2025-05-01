"use client";

import Link from "next/link";

export default function Settings() {
  const items = [
    {
      icon: "fas fa-envelope",
      title: "メール設定",
      desc: "メールテンプレート編集・自動送信設定",
    },
    {
      icon: "fas fa-credit-card",
      title: "支払い設定",
      desc: "プラン変更・支払い履歴",
    },
    {
      icon: "fas fa-bell",
      title: "通知設定",
      desc: "メール通知・重要なお知らせ",
    },
    {
      icon: "fas fa-user",
      title: "アカウント設定",
      desc: "プロフィール・パスワード変更",
    }
  ];

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-10">設定</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <Link
              key={idx}
              href="/preparing"
              className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition p-5 flex flex-col items-start space-y-2"
            >
              <i className={`${item.icon} text-xl text-blue-500`} />
              <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
