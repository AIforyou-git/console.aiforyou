"use client";

import Link from "next/link";

export default function Settings() {
  const items = [
    {
      icon: "fas fa-envelope",
      title: "メール設定",
      desc: "自動送信設定・メール送信先",
      href: "/client-dashboard/settings/email",
    },
    {
      icon: "fas fa-credit-card",
      title: "ご契約内容",
      desc: "プラン内容・ご解約について",
      href: "/client-dashboard/settings/billing",
    },
    //{
    //  icon: "fas fa-bell",
    //  title: "通知設定",
    //  desc: "メール通知・重要なお知らせ",
    //  href: "/client-dashboard/settings/notification",
    //},
    {
      icon: "fas fa-user",
      title: "アカウント設定",
      desc: "プロフィール・パスワード変更",
      href: "/client-dashboard/settings/account",
    }
  ];

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-10">設定</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition p-5 flex flex-col items-start space-y-2"
            >
              <i className={`${item.icon} text-xl text-blue-500`} />
              <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 下部リンクナビゲーション（ログインページと統一） */}
      <div className="mt-12 border-t border-gray-200 pt-6 text-center text-sm text-gray-500 space-x-4">
      <a href="/legal/privacy">プライバシーポリシー</a>
<a href="/legal/service">サービス概要</a>
<a href="/legal/terms">利用規約</a>
<a href="/legal/tokusho">特商法表記</a>
      </div>
    </div>
  );
}
