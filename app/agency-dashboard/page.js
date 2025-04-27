"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabaseClient";

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [clientInviteUrl, setClientInviteUrl] = useState("");
  const [message, setMessage] = useState("");
  const [userList, setUserList] = useState([]);
  const [clientList, setClientList] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 🔶 紹介URL取得
        const { data: userData, error: userFetchError } = await supabase
          .from("users")
          .select("client_invite_url")
          .eq("id", user.id)
          .single();

        if (userFetchError) {
          console.error("❌ 紹介URL取得エラー:", userFetchError);
          setClientInviteUrl("取得エラー");
        } else {
          setClientInviteUrl(userData?.client_invite_url || "未設定");
        }

        // 🟣 USER一覧取得
        const { data: referredUsers, error: usersFetchError } = await supabase
          .from("users")
          .select("id, email, created_at")
          .eq("agency_id", user.id)
          .eq("role", "user")
          .order("created_at", { ascending: false });

        if (usersFetchError) {
          console.error("❌ ユーザー一覧取得エラー:", usersFetchError);
        } else {
          setUserList(referredUsers || []);
        }

        // 🟢 CLIENT一覧取得
        const { data: referredClients, error: clientsFetchError } = await supabase
          .from("clients")
          .select("id, name, created_at")
          .eq("agency_id", user.id)
          .order("created_at", { ascending: false });

        if (clientsFetchError) {
          console.error("❌ クライアント一覧取得エラー:", clientsFetchError);
        } else {
          setClientList(referredClients || []);
        }

      } catch (err) {
        console.error("❌ データ取得中にエラーが発生:", err);
      }
    };

    fetchData();
  }, [user]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(clientInviteUrl);
      setMessage("📋 コピーしました！");
    } catch {
      setMessage("❌ コピーに失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-orange-600">🏢 代理店ダッシュボード</h1>
          <p className="text-gray-600 text-sm mt-1">
            あなたが管理するクライアントとユーザーを一括管理できます。
          </p>
        </div>

        {/* 紹介URL */}
        <div className="bg-white border border-orange-200 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-bold text-orange-500">📨 クライアント紹介URL</h2>
          <p className="text-sm text-gray-700">
            クライアント向けに使用できる紹介URLです。
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={clientInviteUrl}
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
            >
              📋 コピー
            </button>
          </div>
          {message && (
            <p className="text-sm text-green-600 pt-2">{message}</p>
          )}
        </div>

        {/* 稼働中のユーザー */}
        <div className="bg-white border border-orange-200 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-purple-600 mb-4">👥 稼働中のユーザー</h2>
          {userList.length === 0 ? (
            <p className="text-sm text-gray-500">現在、紐づけられたユーザーはいません。</p>
          ) : (
            <ul className="space-y-2">
              {userList.map((u) => (
                <li key={u.id} className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-gray-800">{u.email}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 稼働中のクライアント */}
        <div className="bg-white border border-emerald-200 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-emerald-600 mb-4">🧑‍💼 稼働中のクライアント</h2>
          {clientList.length === 0 ? (
            <p className="text-sm text-gray-500">現在、紐づけられたクライアントはいません。</p>
          ) : (
            <ul className="space-y-2">
              {clientList.map((c) => (
                <li key={c.id} className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-gray-800">{c.name || "(無名クライアント)"}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
