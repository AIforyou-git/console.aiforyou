"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authProvider";
import Link from "next/link";

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const INDUSTRIES = [
  "農業，林業", "漁業","鉱業，採石業，砂利採取業","建設業","製造業","電気・ガス・熱供給・水道業","情報通信業","運輸業，郵便業","卸売業，小売業","金融業，保険業","不動産業，物品賃貸業","学術研究，専門・技術サービス業","宿泊業，飲食サービス業","生活関連サービス業，娯楽業","教育，学習支援業","医療，福祉","複合サービス事業","サービス業（他に分類されないもの）","公務（他に分類されるものを除く）","分類不能の産業"
];

export default function ClientUpdatePage() {
  const { user, loading } = useAuth();

  const [userInfo, setUserInfo] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);

  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [name, setName] = useState("");
  const [regionPrefecture, setRegionPrefecture] = useState("");
  const [regionCity, setRegionCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [email, setEmail] = useState(""); // 表示専用
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      if (!user?.id) return;

      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("*")
          .eq("uid", user.id)
          .maybeSingle();

        if (userError) throw userError;
        setUserInfo(userData);
        setClientInfo(clientData);

        if (clientData) {
          setCompany(clientData.company || "");
          setPosition(clientData.position || "");
          setName(clientData.name || "");
          setRegionPrefecture(clientData.region_prefecture || "");
          setRegionCity(clientData.region_city || "");
          setIndustry((clientData.industry || "").trim());
          setMemo(clientData.memo || "");
        }

        setEmail(userData.email || "");

      } catch (error) {
        console.error("全体取得エラー:", error.message);
        setMessage("❌ 情報の取得に失敗しました");
      }
    };

    if (!loading) fetchAll();
  }, [user, loading]);

  const registerClient = async () => {
    if (!user?.id) return;

    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("clients")
        .upsert({
          uid: user.id,
          company,
          position,
          name,
          region_prefecture: regionPrefecture,
          region_city: regionCity,
          industry,
          memo,
          profile_completed: true,
          updated_at: now,
        }, {
          onConflict: "uid"
        });

      if (error) throw error;

      setMessage("✅ 登録内容を更新しました！");
    } catch (error) {
      console.error("更新失敗:", error.message);
      setMessage("❌ 登録内容の更新に失敗しました");
    }
  };

  const effectiveIndustries =
    industry && !INDUSTRIES.includes(industry)
      ? [industry, ...INDUSTRIES]
      : INDUSTRIES;

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">登録内容の更新</h2>
        <form className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">会社名:</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">役職:</label>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">お名前:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">メールアドレス:</label>
            <input type="email" value={email} disabled className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-500" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">都道府県:</label>
            <select value={regionPrefecture} onChange={(e) => setRegionPrefecture(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">都道府県を選択</option>
              {PREFECTURES.map((pref) => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">市区町村:</label>
            <input type="text" value={regionCity} onChange={(e) => setRegionCity(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">業種:</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">業種を選択</option>
              {effectiveIndustries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">メモ（任意）:</label>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={500} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>

          <div className="space-y-3 pt-4">
            <button type="button" onClick={registerClient} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded">
              登録する
            </button>
            {message && (
              <p className="text-green-600 text-sm pt-1">{message}</p>
            )}
          </div>
        </form>

        <div className="pt-8 text-center">
          <Link href="/user-dashboard">
            <button className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-5 py-2 rounded">
              ⬅️ ダッシュボードへ戻る
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
