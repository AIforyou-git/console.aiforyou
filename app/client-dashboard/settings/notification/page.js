// app/settings/notification/page.js
"use client";

export default function NotificationSettings() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">通知設定</h1>
      <form className="space-y-6">
        <div>
          <label className="block mb-1">通知タイプ</label>
          <div className="space-y-2">
            <label className="block"><input type="checkbox" /> 緊急通知</label>
            <label className="block"><input type="checkbox" /> 定期レポート</label>
            <label className="block"><input type="checkbox" /> アップデート情報</label>
          </div>
        </div>
        <div>
          <label className="block mb-1">通知チャネル</label>
          <div className="space-y-2">
            <label className="block"><input type="checkbox" /> メール</label>
            <label className="block"><input type="checkbox" /> LINE</label>
            <label className="block"><input type="checkbox" /> SMS</label>
          </div>
        </div>
        <div>
          <label className="block mb-1">通知時間帯</label>
          <input type="text" placeholder="例：平日 9:00〜18:00" className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">保存</button>
      </form>
    </div>
  );
}
