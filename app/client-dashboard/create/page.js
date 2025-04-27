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
  "農業，林業", "漁業", "鉱業，採石業，砂利採取業", "建設業", "製造業",
  "電気・ガス・熱供給・水道業", "情報通信業", "運輸業，郵便業", "卸売業，小売業",
  "金融業，保険業", "不動産業，物品賃貸業", "学術研究，専門・技術サービス業",
  "宿泊業，飲食サービス業", "生活関連サービス業，娯楽業", "教育，学習支援業",
  "医療，福祉", "複合サービス事業", "サービス業（他に分類されないもの）",
  "公務（他に分類されるものを除く）", "分類不能の産業"
];

export default function ClientUpdatePage() {
  const { user, loading } = useAuth();
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [name, setName] = useState("");
  const [regionPrefecture, setRegionPrefecture] = useState("");
  const [regionCity, setRegionCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [memo, setMemo] = useState("");
  const [email, setEmail] = useState(""); // 表示専用
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
        if (clientError) throw clientError;

        if (clientData) {
          setCompany(clientData.company ?? "");
          setPosition(clientData.position ?? "");
          setName(clientData.name ?? "");
          setRegionPrefecture(clientData.region_prefecture ?? "");
          setRegionCity(clientData.region_city ?? "");
          setIndustry((clientData.industry ?? "").trim());
          setMemo(clientData.memo ?? "");
        }

        setEmail(userData.email ?? "");
      } catch (error) {
        console.error("全体取得エラー:", (error instanceof Error ? error.message : error));
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
          onConflict: "uid",
        });

      if (error) throw error;

      setMessage("✅ 登録内容を更新しました！");
    } catch (error) {
      console.error("更新失敗:", (error instanceof Error ? error.message : error));
      setMessage("❌ 登録内容の更新に失敗しました");
    }
  };

  const effectiveIndustries = industry && !INDUSTRIES.includes(industry)
    ? [industry, ...INDUSTRIES]
    : INDUSTRIES;

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">登録内容の更新</h2>
        <form className="space-y-4">
          <Input label="会社名" value={company} onChange={setCompany} />
          <Input label="役職" value={position} onChange={setPosition} />
          <Input label="お名前" value={name} onChange={setName} required />
          <Input label="メールアドレス" value={email} disabled />
          <Select label="都道府県" value={regionPrefecture} onChange={setRegionPrefecture} options={PREFECTURES} required />
          <Input label="市区町村" value={regionCity} onChange={setRegionCity} />
          <Select label="業種" value={industry} onChange={setIndustry} options={effectiveIndustries} />
          <Textarea label="メモ（任意）" value={memo} onChange={setMemo} />

          <div className="space-y-3 pt-4">
            <button type="button" onClick={registerClient} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded">
              登録する
            </button>
            {message && <p className="text-green-600 text-sm pt-1">{message}</p>}
          </div>
        </form>

        <div className="pt-8 text-center">
          <Link href="/client-dashboard">
            <button className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-5 py-2 rounded">
              ⬅️ ダッシュボードへ戻る
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// 共通Inputコンポーネント
function Input({ label, value, onChange, required = false, disabled = false }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium">{label}:</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
        className={`w-full border border-gray-300 rounded px-3 py-2 ${disabled ? 'bg-gray-100 text-gray-500' : ''}`}
      />
    </div>
  );
}

// 共通Selectコンポーネント
function Select({ label, value, onChange, options, required = false }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium">{label}:</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        className="w-full border border-gray-300 rounded px-3 py-2"
      >
        <option value="">選択してください</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// 共通Textareaコンポーネント
function Textarea({ label, value, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium">{label}:</label>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        maxLength={500}
        className="w-full border border-gray-300 rounded px-3 py-2"
      />
    </div>
  );
}
