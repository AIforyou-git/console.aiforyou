"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authProvider";
import ClientInfoForm from "../ClientInfoForm"; // ✅ 既存の ClientInfoForm を流用

export default function ClientDashboardIntro() {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkClient = async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from("clients")
        .select("profile_completed")
        .eq("uid", user.id)
        .maybeSingle();

      if (!data || !data.profile_completed) {
        setShowModal(true); // ✅ 未登録ならモーダル表示
      } else {
        // ✅ 登録済みなら即通常ダッシュボードへ
        router.push("/client-dashboard");
      }
    };

    if (!loading) {
      checkClient();
    }
  }, [user, loading]);

  const handleClose = () => {
    setShowModal(false);
    router.push("/client-dashboard"); // ✅ モーダル完了後に既存ダッシュボードへ遷移
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[95%] max-w-xl shadow-2xl">
            <ClientInfoForm onClose={handleClose} />
          </div>
        </div>
      )}
    </div>
  );
}
