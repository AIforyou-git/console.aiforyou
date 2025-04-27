"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authProvider";

export default function ReferredClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;

      try {
        const { data: relations, error: relationError } = await supabase
          .from("referral_relations")
          .select("*")
          .eq("referrer_id", user.id);

        if (relationError) throw relationError;

        const referredIds = relations.map((r) => r.referred_id);

        const { data: clientInfo, error: clientError } = await supabase
          .from("clients")
          .select("uid, name, created_at")
          .in("uid", referredIds);

        if (clientError) throw clientError;

        const merged = relations.map((rel) => {
          const client = clientInfo.find((c) => c.uid === rel.referred_id);
          return {
            id: rel.referred_id,
            name: client?.name ?? "（未登録）",
            created_at: client?.created_at ?? null,
            masked_email: rel.referred_email_masked,
            status: rel.referred_status ?? "未設定",
          };
        });

        setClients(merged);
      } catch (err) {
        console.error("紹介クライアント取得エラー：", err.message);
        setError("紹介されたクライアントの取得に失敗しました。");
      }
    };

    fetchClients();
  }, [user]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">📄 紹介したクライアント一覧</h1>

      {error && <p className="text-red-500">{error}</p>}

      {clients.length === 0 ? (
        <p className="text-gray-600">紹介されたクライアントがまだ存在しません。</p>
      ) : (
        <ul className="space-y-4">
          {clients.map((client) => (
            <li key={client.id} className="p-5 bg-white rounded-2xl shadow-md border border-gray-200">
              <div className="text-lg font-bold text-gray-800 mb-1">{client.name}</div>
              <div className="text-sm text-gray-500 mb-2">
                登録日: {client.created_at ? new Date(client.created_at).toLocaleDateString() : "未登録"}
              </div>
              <div className="mb-1">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">
                  ステータス: {client.status}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                メール（マスク済）: {client.masked_email ?? "未取得"}
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => history.back()}
        className="mt-6 inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded shadow-sm"
      >
        ← 戻る
      </button>
    </div>
  );
}
