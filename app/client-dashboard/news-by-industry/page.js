"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabaseClient";
import NewsControlPage from "./index";

export default function NewsByIndustryPage() {
  const { user, loading } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("uid", user.id)
        .maybeSingle();

      if (!error) setClientData(data);
      setFetching(false);
    };

    if (!loading) fetchClientData();
  }, [user, loading]);

  if (loading || fetching) {
    return <div className="p-6 text-center text-gray-500">🔄 クライアント情報を取得中です...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📰 補助金ニュース管理</h1>
        <NewsControlPage clientData={clientData} />
      </div>
    </div>
  );
}
