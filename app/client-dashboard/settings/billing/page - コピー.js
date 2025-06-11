// app/settings/billing/page.js
"use client";

export default function BillingSettings() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">支払い設定</h1>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">現在のプラン</h2>
        <p>スタンダードプラン（月額 ¥3,980）</p>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">プラン変更</h2>
        <select className="w-full p-2 border rounded">
          <option>スタンダードプラン</option>
          <option>プレミアムプラン</option>
        </select>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">請求履歴</h2>
        <ul className="list-disc pl-5 text-sm text-gray-600">
          <li>2025/04 請求書 <a href="#" className="text-blue-600 underline">PDF</a></li>
          <li>2025/03 請求書 <a href="#" className="text-blue-600 underline">PDF</a></li>
        </ul>
      </div>
    </div>
  );
}

