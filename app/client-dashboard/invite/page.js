"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authProvider";
import { supabase } from "@/lib/supabaseBrowserClient";

export default function InvitePage() {
  const { user } = useAuth();
  const [inviteUrl, setInviteUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchUrl = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("client_invite_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("紹介URL取得エラー:", error);
        setInviteUrl("取得エラー");
      } else {
        setInviteUrl(data?.client_invite_url || "未設定");
      }
    };

    fetchUrl();
  }, [user]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setMessage("📋 コピーしました！");
    } catch (error) {
      setMessage("❌ コピーに失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5faff] px-4 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-emerald-100 p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">📨 紹介URL</h1>
          <p className="text-sm text-gray-700">
            このサービスが「使えそう」と思ったら、ぜひお知り合いにも教えてあげてください。<br />
            <span className="text-emerald-600 font-medium">
              AIforyou は “誰かのために役立つAI” を広めていきます。
            </span>
          </p>
        </div>

        {inviteUrl && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">あなた専用の紹介リンク</label>
              <div className="relative">
                <input
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-sm pr-32"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1.5 rounded-full shadow text-sm"
                >
                  📋 コピーする
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <a href={`mailto:?subject=AIforyouのご紹介&body=このサービス、使えそうだったので共有します！%0A${inviteUrl}`}>
                <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full shadow">
                  ✉️ メールで送る
                </button>
              </a>

              <a
                href={`https://social-plugins.line.me/lineit/share?url=${inviteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full shadow">
                  💬 LINEで送る
                </button>
              </a>

              <a href={`sms:?body=AIforyouおすすめです！こちらからどうぞ：${inviteUrl}`}>
                <button className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded-full shadow">
                  📱 SMSで送る
                </button>
              </a>
            </div>
          </div>
        )}

        {message && <p className="text-sm text-green-600 pt-2">{message}</p>}

        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <a href="/client-dashboard/referred" className="flex-1">
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full shadow">
              📋 紹介した人の一覧を見る
            </button>
          </a>
          <a href="/client-dashboard" className="flex-1">
            <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-full">
              🔙 ダッシュボードへ戻る
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}