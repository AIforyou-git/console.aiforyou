"use client";
import NewsControlPage from "./index";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="w-full">  //横幅ゆとり
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📰 補助金ニュース管理</h1>
        <NewsControlPage />
      </div>
    </div>
  );
}
