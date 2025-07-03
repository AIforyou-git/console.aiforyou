
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
//import ClientInfoForm from "./ClientInfoForm";
import NewsControlPage from "./news-control"; // ← 変更ポイント

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const [clientData, setClientData] = useState(null);
  //const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [clientName, setClientName] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
  const loadClientData = async () => {
    if (!user?.id) return;

    try {
      // ✅ Stripe→Supabaseの最新同期API呼び出し
      const syncRes = await fetch("/api/stripe_v3/stripe-sync", {
        method: "GET",
        headers: {
          "x-user-id": user.id,
        },
      });

      if (!syncRes.ok) {
        console.warn("⚠️ Stripe同期に失敗", await syncRes.json());
      }

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("uid", user.id)
        .maybeSingle();

      if (error) throw error;

      setClientData(data);
      const name = data?.name || user.email?.split("@")[0];
      setClientName(name);
    } catch (err) {
      console.error("❌ クライアント情報取得エラー:", err);
      if (retryCount < 3) {
        setTimeout(() => setRetryCount((prev) => prev + 1), 1000);
      }
    } finally {
      setFetching(false);
    }
  };

  if (!loading) loadClientData();
}, [user, loading, retryCount]);


 // const handleModalClose = async () => {
 //   setShowInfoModal(false);
 //   setIsSyncing(true);

 //   try {
 //     const now = new Date().toISOString();
 //     const { error } = await supabase
 //       .from("users")
 //       .update({ status: "active", last_login: now })
 //       .eq("id", user.id);
 //     if (error) throw error;
 //   } catch (err) {
 //     console.error("❌ Supabase 同期通信失敗:", err.message);
 //   } finally {
 //     setIsSyncing(false);
 //   }
 // };

  if (loading || fetching) {
    return (
      <div className="p-6 text-center text-gray-600">
        🔄 クライアント情報を取得中です...
      </div>
    );
  }

  if (!user || user.role !== "client") {
    return <div className="p-6 text-red-500">アクセス権がありません。</div>;
  }

  return (
    <div className="w-full px-1 sm:px-2 pt-2 pb-32 min-h-screen bg-white">
      <h1 className="text-xl font-semibold text-center text-emerald-800 mb-4">
         {/*  {clientName} 様の最新情報 */}
      </h1>

      <NewsControlPage clientData={clientData} />

      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow z-40">
        <div className="max-w-screen-md mx-auto flex justify-around items-center py-3 px-4 gap-4">
          <a
            href="https://chat.guaido.ai/room/yy3OIWXmJPw4u2RrpxzRwg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white px-4 py-2 rounded-full w-36 shadow-lg text-sm">
              🤖 AI相談
            </button>
          </a>
          <Link href="/client-dashboard/invite">
            <button className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-full w-36 shadow-lg text-sm">
              📨 友達に紹介
            </button>
          </Link>
        </div>
      </div>

      
      {/*// {showInfoModal && (
      //  <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      //    <div className="bg-white rounded-xl p-6 w-[95%] max-w-xl shadow-2xl">
      //      <ClientInfoForm onClose={handleModalClose} />
      //    </div>
      //  </div>
      //)}*/}

      {isSyncing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[95%] max-w-xl shadow-2xl text-center">
            <p className="text-xl font-bold text-emerald-600">🔄 クライアント情報を保存中です...</p>
            <p className="text-sm mt-2 text-gray-600">少々お待ちください。</p>
          </div>
        </div>
      )}
    </div>
  );
}
