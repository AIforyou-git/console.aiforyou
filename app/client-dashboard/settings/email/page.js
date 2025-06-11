"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // パスは適宜調整

export default function EmailSettings() {
  const [matchByCity, setMatchByCity] = useState(true);
  const [autoMailEnabled, setAutoMailEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); // ユーザーIDを後で取得

  // 初期データ取得
  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user.id);

      const { data, error } = await supabase
        .from("clients")
        .select("match_by_city, auto_mail_enabled")
        .eq("uid", user.id)
        .single();

      if (data) {
        setMatchByCity(data.match_by_city ?? true);
        setAutoMailEnabled(data.auto_mail_enabled ?? false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);

    // ✅ 市区町村チェックがONのとき、登録されていなければブロック
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
          <label className="block mb-1">自動送信　※準備中</label>
          <select
            className="w-full p-2 border rounded"
            value={autoMailEnabled ? "on" : "off"}
            onChange={(e) => setAutoMailEnabled(e.target.value === "on")}
          >
            <option value="off">オフ</option>
            <option value="on">定期的に自動送信（13:00）</option>
          </select>
        </div>

       {/* <div>
          <label className="block mb-1">アンケート送信　※市区町村に差し替え</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="例: 満足度調査2025年春" />
        </div>*/}

        <div>
          <label className="block mb-1">CC追加（最大2人）※準備中</label>
          <input type="email" className="w-full p-2 border rounded mb-2" placeholder="例: cc@example.com" />
          <input type="email" className="w-full p-2 border rounded" placeholder="例: cc2@example.com" />
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
