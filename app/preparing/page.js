"use client";
import Image from "next/image";

export default function PreparingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">🚧 準備中 🚧</h1>
      <p className="text-lg text-gray-700">このページは現在準備中です。</p>
      <p className="text-lg text-gray-700 mb-6">しばらくお待ちください 🐱</p>

      <Image src="/AIforyou-rogo.003_0.png" alt="logo" width={300} height={300} />

      <p className="mt-6 text-sm text-gray-500">またのご訪問をお待ちしています！</p>

      <div className="mt-8">
        <button
          onClick={() => window.history.back()}
          className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-5 py-2 rounded"
        >
          ⬅️ 前のページに戻る
        </button>
      </div>
    </div>
  );
}
