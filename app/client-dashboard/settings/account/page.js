"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";

// ✅ モーダルは動的 import（SSR無効）
//const EmailChangeModal = dynamic(
 // () => import("./email-change/modal"),
 // { ssr: false }
//);

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [logins, setLogins] = useState([]);
  const [message, setMessage] = useState(""); // ✅ パスワード更新ステータス
  const [showModal, setShowModal] = useState(false); // ✅ モーダル表示制御

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from("login_logs")
          .select("login_time, ip_address")
          .eq("uid", user.id)
          .order("login_time", { ascending: false })
          .limit(10);
        setLogins(data || []);
      }
    };
    fetchUser();
  }, []);

  // ✅ パスワード再設定リンク送信処理
  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setMessage("送信中...");

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: 'https://console.aiforyou.jp/reset-password',
    });

    if (error) {
      setMessage("❌ エラーが発生しました：" + error.message);
    } else {
      setMessage("✅ パスワード再設定メールを送信しました。メールをご確認ください。");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">アカウント設定</h1>

      <div className="mb-6">
        <label className="block mb-1 text-sm text-gray-600">メールアドレス</label>
        <input
          value={user?.email || ""}
          disabled
          className="w-full p-2 border rounded bg-gray-100 text-gray-700"
        />
        
      </div>

      <div className="mb-8">
        <label className="block mb-1 text-sm text-gray-600">パスワード</label>
        <button
          onClick={handlePasswordReset}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
        >
          パスワードを変更する
        </button>
        {message && (
          <p className="text-sm mt-2 text-green-600">{message}</p>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-3 text-gray-800">直近のログイン履歴</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          {logins.map((log, i) => (
            <li key={i} className="border-b pb-1">
              {dayjs(log.login_time).format("YYYY/MM/DD HH:mm")} - {log.ip_address}
            </li>
          ))}
          {logins.length === 0 && (
            <li className="text-gray-400">ログイン履歴がありません</li>
          )}
        </ul>
      </div>

      {showModal && (
        <EmailChangeModal
          currentEmail={user?.email}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
