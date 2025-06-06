"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authProvider";
import ClientInfoForm from "../ClientInfoForm";

export default function ClientDashboardIntro(): React.JSX.Element {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkClientAndPlan = async () => {
      if (!user?.id) return;

      // クライアントプロフィール確認
      const { data: client } = await supabase
        .from("clients")
        .select("profile_completed")
        .eq("uid", user.id)
        .maybeSingle();

      if (!client || !client.profile_completed) {
        setShowModal(true);
        return;
      }

      // プラン確認
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (userError || !userData) {
        console.error("プラン取得失敗:", userError?.message);
        router.push("/login");
        return;
      }

      if (userData.plan === "premium") {
        router.push("/client-dashboard");
      } else {
        setPlan(userData.plan || "free");
      }
    };

    if (!loading) {
      checkClientAndPlan();
    }
  }, [user, loading, router]);

  const handleClose = (): void => {
    setShowModal(false);
  };

  const handleStartTrial = (): void => {
    router.push("/stripe_v3/plans");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white p-8 text-center relative">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[95%] max-w-xl shadow-2xl">
            <ClientInfoForm onClose={handleClose} />
          </div>
        </div>
      )}

      {!showModal && (
        <>
          <h1 className="text-3xl font-bold text-emerald-800 mb-4">ようこそ！</h1>
          <p className="text-gray-700 text-base mb-6 leading-relaxed">
            本サービスでは、支援情報の検索やAIによる相談など<br />
            実務に直結する便利な機能を多数ご用意しています。
            <br />
            <br />
            <strong>トライアル登録（15日間）</strong>を行うことで、<br />
            <span className="text-emerald-600 font-semibold">
              すべての機能を即時ご体験いただけます。
            </span>
          </p>

          {errorMsg && (
            <p className="text-red-600 mb-4 text-sm">{errorMsg}</p>
          )}

          {plan !== "premium" && (
            <button
              onClick={handleStartTrial}
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-md transition disabled:opacity-60"
            >
              {isLoading ? "処理中..." : "トライアルを開始して利用する"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
