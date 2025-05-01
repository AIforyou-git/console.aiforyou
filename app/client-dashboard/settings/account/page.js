// app/settings/account/page.js
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [logins, setLogins] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setName(user.user_metadata?.name || "");
        // login logs を取得（仮定テーブル login_logs）
        const { data } = await supabase
          .from("login_logs")
          .select("login_time, ip_address")
          .eq("uid", user.id)
          .order("login_time", { ascending: false });
        setLogins(data || []);
      }
    };
    fetchUser();
  }, []);

  const handlePasswordChange = async () => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) alert("変更失敗: " + error.message);
    else alert("パスワード変更に成功しました");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">アカウント設定</h1>
      <div className="mb-6">
        <label className="block mb-1">登録メール</label>
        <input
          value={user?.email || ""}
          disabled
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-1">表示名</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-1">新しいパスワード</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handlePasswordChange}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          パスワード変更
        </button>
      </div>
      <div>
        <h2 className="font-semibold mb-2">最近のログイン履歴</h2>
        <ul className="text-sm text-gray-600">
          {logins.map((log, i) => (
            <li key={i} className="mb-1">
              {log.login_time} - {log.ip_address}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}