"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabaseClient";

export default function CreateCustomerPage() {
  const { user, loading } = useAuth();
  const [clientList, setClientList] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("referral_relations")
          .select("referred_email_masked, referred_status, created_at")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setClientList(data || []);
      } catch (err) {
        console.error("❌ クライアント取得エラー:", err);
      }
    };

    if (!loading) fetchClients();
  }, [user, loading]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">📋 紹介クライアント一覧（確認用）</h1>

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
  );
}
