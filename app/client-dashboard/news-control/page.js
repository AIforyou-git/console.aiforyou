"use client";
import NewsList from "./NewsList";

export default function NewsControlPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📰 補助金ニュース管理</h1>
        <NewsList />
      </div>
    </div>
  );
}
