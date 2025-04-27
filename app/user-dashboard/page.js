"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabaseClient";

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState("");
  const [clientInviteUrl, setClientInviteUrl] = useState("");
  const [message, setMessage] = useState("");
  const [clientList, setClientList] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  const getJapanTime = () =>
    new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  useEffect(() => {
    const updateAndFetch = async () => {
      if (!user?.id) {
        console.warn("⚠️ user.id が undefined です");
        return;
      }

      console.log("✅ user.id:", user.id);
      setUserEmail(user?.email || "メール不明");

      try {
        const now = getJapanTime();

        const { data: statusData, error: statusError } = await supabase
          .from("users")
          .select("status, client_invite_url")
          .eq("id", user.id)
          .single();

        if (statusError) {
          console.error("❌ ステータス取得エラー:", statusError);
        }

        if (statusData?.status === "pending") {
          const { error: updateError } = await supabase
            .from("users")
            .update({ status: "active", last_login: now })
            .eq("id", user.id);

          if (updateError) {
            console.error("❌ ステータス更新エラー:", updateError);
          }
          setStatus("active");
        } else {
          setStatus(statusData?.status || "active");

          const { error: loginUpdateError } = await supabase
            .from("users")
            .update({ last_login: now })
            .eq("id", user.id);

          if (loginUpdateError) {
            console.error("❌ ログイン更新エラー:", loginUpdateError);
          }
        }

        setClientInviteUrl(statusData?.client_invite_url || "");

        const { data: clients, error: clientsError } = await supabase
          .from("referral_relations")
          .select("referred_email_masked, referred_status, created_at")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false });

        if (clientsError) {
          console.error("❌ クライアント取得エラー:", clientsError);
        }

        setClientList(clients || []);
      } catch (error) {
        console.error("❌ 全体エラー:", error);
      }
    };

    if (!loading) updateAndFetch();
  }, [user, loading]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(clientInviteUrl);
      setMessage("📋 コピーしました！");
    } catch (error) {
      setMessage("❌ コピーに失敗しました");
    }
  };

  if (loading) return <div className="p-6">読み込み中...</div>;
  if (!user || user.role !== "user")
    return <div className="p-6 text-red-500">アクセス権がありません。</div>;

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-10 pb-32">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-600">🧑‍💼 ユーザーダッシュボード</h1>
          <p className="text-gray-600 text-sm mt-1">クライアント招待・管理はこちらから行えます。</p>
        </div>

        {/* 🎁 ギフトプラン制限（ダミー） */}
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded text-sm font-medium">
          ギフトプランであと <strong>3人</strong> 登録可能です（ダミー）
        </div>

        {/* 📨 紹介URL */}
        <div className="bg-white border border-blue-200 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-bold text-blue-500">📨 クライアント紹介URL</h2>
          <p className="text-sm text-gray-700">
            あなた専用の紹介URLを使って、クライアントを招待できます。
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
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              📋 コピー
            </button>
          </div>
          {message && <p className="text-sm text-green-600 pt-2">{message}</p>}
        </div>

        {/* 📒 紹介クライアント一覧 */}
        <div className="bg-white border border-blue-200 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-blue-600 mb-4">📒 紹介クライアント一覧</h2>
          {clientList.length === 0 ? (
            <p className="text-sm text-gray-500">現在、紹介したクライアントはいません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-blue-100 text-blue-800">
                  <tr>
                    <th className="px-3 py-2 border">メール</th>
                    <th className="px-3 py-2 border">登録日時</th>
                    <th className="px-3 py-2 border">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {clientList.map((client, index) => (
                    <tr key={index} className="hover:bg-blue-50">
                      <td className="px-3 py-2 border">{client.referred_email_masked || "-"}</td>
                      <td className="px-3 py-2 border">
                        {client.created_at
                          ? new Date(client.created_at).toLocaleDateString("ja-JP")
                          : "-"}
                      </td>
                      <td className="px-3 py-2 border">{client.referred_status || "active"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 👤 ログイン情報フッター */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow z-40">
        <div className="max-w-screen-md mx-auto flex justify-between items-center py-3 px-4">
          <div className="text-xs text-gray-500 truncate">
            👤 {userEmail}
          </div>
          <div className="text-xs text-gray-400">© aiforyou</div>
        </div>
      </div>
    </div>
  );
}
