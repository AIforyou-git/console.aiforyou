"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import ClientInfoForm from "./ClientInfoForm";
import NewsList from "./news-control/NewsList";

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [clientName, setClientName] = useState("");

  const [retryCount, setRetryCount] = useState(0); // ✅ 再試行カウント
  const [fetching, setFetching] = useState(true); // ✅ 表示制御フラグ

  useEffect(() => {
    const loadClientData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("uid", user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data || !data.profile_completed) {
          setShowInfoModal(true);
        }

        setClientData(data);

        const name = data?.name || user.email?.split("@")[0];
        setClientName(name);
      } catch (err) {
        console.error("❌ クライアント情報取得エラー:", err);
        if (retryCount < 3) {
          setTimeout(() => setRetryCount((prev) => prev + 1), 1000);
        }
      } finally {
        setFetching(false); // ✅ 成否に関係なく表示許可
      }
    };

    if (!loading) loadClientData();
  }, [user, loading, retryCount]);

  const handleModalClose = async () => {
    setShowInfoModal(false);
    setIsSyncing(true);

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("users")
        .update({ status: "active", last_login: now })
        .eq("id", user.id);

      if (error) throw error;
      console.log("✅ Supabase にユーザーステータスを同期しました");
    } catch (err) {
      console.error("❌ Supabase 同期通信失敗:", err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading || fetching) return (
    <div className="p-6 text-center text-gray-600">
      🔄 クライアント情報を取得中です...
    </div>
  );

  if (!user || user.role !== "client") {
    return <div className="p-6 text-red-500">アクセス権がありません。</div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto px-2 pt-12 pb-32 relative bg-[#f5faff] min-h-screen">
      <h1 className="text-sm text-center text-emerald-800 mb-2">
        {clientName} 様の最新情報
      </h1>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
        <NewsList clientData={clientData} /> {/* ✅ データ渡す */}
      </div>

      {/* フッターメニュー */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow z-40">
        <div className="max-w-screen-md mx-auto flex justify-around items-center py-3">
          <a
            href="https://chat.guaido.ai/room/yy3OIWXmJPw4u2RrpxzRwg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-emerald-400 hover:bg-emerald-700 text-white px-5 py-2 rounded-full w-40 shadow-md">
              🤖 AI相談
            </button>
          </a>
          <Link href="/client-dashboard/invite">
            <button className="bg-emerald-400 hover:bg-emerald-600 text-white px-5 py-2 rounded-full w-40 shadow-md">
              📨 友達に紹介
            </button>
          </Link>
        </div>
      </div>

      {/* プロフィール登録モーダル */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-xl shadow-2xl">
            <ClientInfoForm onClose={handleModalClose} />
          </div>
        </div>
      )}

      {isSyncing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-xl shadow-2xl text-center">
            <p className="text-xl font-bold text-emerald-600">🔄 クライアント情報を保存中です...</p>
            <p className="text-sm mt-2 text-gray-600">少々お待ちください。</p>
          </div>
        </div>
      )}
    </div>
  );
}
