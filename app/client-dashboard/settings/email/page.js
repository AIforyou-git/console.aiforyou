"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // パスは適宜調整

export default function EmailSettings() {
  const [matchByCity, setMatchByCity] = useState(true);
  //const [autoMailEnabled, setAutoMailEnabled] = useState(false);
  const [autoMailEnabled, setAutoMailEnabled] = useState(true); // デフォルトONに変更

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [ccEmail1, setCcEmail1] = useState("");
  const [ccEmail2, setCcEmail2] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user.id);

      const { data, error } = await supabase
        .from("clients")
        .select("match_by_city, auto_mail_enabled, cc_email_1, cc_email_2")
        .eq("uid", user.id)
        .single();

      if (data) {
        setMatchByCity(data.match_by_city ?? true);
        setAutoMailEnabled(data.auto_mail_enabled ?? false);
        setCcEmail1(data.cc_email_1 ?? user.email); // 修正：初期値はアカウントメール
        setCcEmail2(data.cc_email_2 ?? "");
      } else {
        setCcEmail1(user.email); // 修正：データがない場合も初期化
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);

    if (matchByCity) {
      const { data, error } = await supabase
        .from("clients")
        .select("region_city")
        .eq("uid", userId)
        .single();

      if (error) {
        setLoading(false);
        alert("市区町村の確認に失敗しました：" + error.message);
        return;
      }

      if (!data?.region_city || data.region_city.trim() === "") {
        setLoading(false);
        alert("市区町村を配信条件にするには、市区町村情報の登録が必要です。プロフィールから設定してください。");
        return;
      }
    }

    const { error } = await supabase
      .from("clients")
      .update({
        match_by_city: matchByCity,
        auto_mail_enabled: autoMailEnabled,
        cc_email_1: ccEmail1, // 修正：保存処理に追加
        cc_email_2: ccEmail2,
      })
      .eq("uid", userId);

    setLoading(false);
    if (error) {
      alert("保存に失敗しました：" + error.message);
    } else {
      alert("設定を保存しました");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">メール設定</h1>
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div>
          <label className="block mb-1">自動送信の設定　/ 初期設定は自動です</label>
          <select
            className="w-full p-2 border rounded"
            value={autoMailEnabled ? "on" : "off"}
            onChange={(e) => setAutoMailEnabled(e.target.value === "on")}
          >
            <option value="off">オフ</option>
            <option value="on">定期的に自動送信（13:00）</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">メール送信先　/　CC追加（最大2人）</label>
          <input
            type="email"
            className="w-full p-2 border rounded mb-2"
            placeholder="例: cc@example.com"
            value={ccEmail1}
            onChange={(e) => setCcEmail1(e.target.value)}
          />
          <input
            type="email"
            className="w-full p-2 border rounded"
            placeholder="例: cc2@example.com"
            value={ccEmail2}
            onChange={(e) => setCcEmail2(e.target.value)}
          />
        </div>

        {/* ✅ 市区町村マッチスイッチ 
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="match_by_city"
            checked={matchByCity}
            onChange={(e) => setMatchByCity(e.target.checked)}
            className="h-4 w-4 text-blue-600"
          />
          <label htmlFor="match_by_city" className="text-sm text-gray-700">
            市区町村まで配信対象を絞り込む（ONで厳密／OFFで都道府県単位）
          </label>
        </div>*/}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "保存中…" : "保存"}
        </button>
      </form>
    </div>
  );
}
