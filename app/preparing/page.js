"use client";
import Image from "next/image";

export default function PreparingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <h1 className="text-3xl font-extrabold text-cyan-600 mb-4 animate-bounce">
        🔵 準備中です 🔵
      </h1>

      <p className="text-base sm:text-lg text-gray-700">
        このページはただいま準備中です。
      </p>
      <p className="text-base sm:text-lg text-gray-700 mb-6">
        パワーアップして戻ってきます 🐰
      </p>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-cyan-100">
      <Image
  src="/AIforyou-rogo.003_0.png"
  alt="AI for you logo"
  width={240}
  height={240}
  priority
  style={{ width: "100%", height: "auto" }} // ✅ 明示する
/>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        またのご訪問を心よりお待ちしております 🌸
      </p>

      <div className="mt-8">
        <button
          onClick={() => window.history.back()}
          className="bg-cyan-400 hover:bg-cyan-500 text-white text-sm px-6 py-2 rounded-full shadow transition-all duration-200"
        >
          ⬅️ 前のページに戻る
        </button>
      </div>
    </div>
  );
}
