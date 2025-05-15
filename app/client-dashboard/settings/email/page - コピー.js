// app/settings/email/page.js
"use client";

export default function EmailSettings() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">メール設定</h1>
      <form className="space-y-6">
        <div>
          <label className="block mb-1">自動送信</label>
          <select className="w-full p-2 border rounded">
            <option>オフ</option>
            <option>登録直後に送信</option>
            <option>7日後にリマインド</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">アンケート送信</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="例: 満足度調査2025年春" />
        </div>
        <div>
          <label className="block mb-1">CC追加（最大2人）</label>
          <input type="email" className="w-full p-2 border rounded mb-2" placeholder="例: cc@example.com" />
          <input type="email" className="w-full p-2 border rounded" placeholder="例: cc2@example.com" />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          保存
        </button>
      </form>
    </div>
  );
}
