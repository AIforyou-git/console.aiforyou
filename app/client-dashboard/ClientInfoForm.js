"use client";

import { useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

const prefectureList = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const industryList = [
  "IT・ソフトウェア", "製造業", "医療・福祉", "教育・学習支援", "建設・不動産",
  "小売・卸売", "金融・保険", "運輸・物流", "農林水産業", "その他"
];

export default function ClientInfoForm({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    regionPrefecture: "",
    industry: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const isFormValid = form.name && form.regionPrefecture && form.industry;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setMessage("");

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("ユーザー情報が取得できません");

      const userRef = doc(db, "clients", user.uid);
      await updateDoc(userRef, {
        ...form,
        profileCompleted: true,
      });

      setMessage("✅ プロフィールを保存しました。ありがとうございます！");
      onClose?.();
    } catch (error) {
      console.error("更新エラー:", error);
      setMessage("❌ 保存に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 text-center"
      >
        <h2 className="text-xl font-bold mb-2">🎉 はじめまして。AIforyouへようこそ！</h2>
        <p className="text-sm text-gray-700">
          快適にご利用いただくために、最初に少しだけあなたの情報を教えてください。
        </p>
        <ul className="text-left mt-3 text-sm list-disc list-inside">
          <li>お名前</li>
          <li>事業活動の地域（都道府県）</li>
          <li>業種（ご活動のジャンル）</li>
        </ul>
        <p className="text-xs mt-2 text-gray-500">
          ※ 後からいつでも変更できますのでご安心ください 🌼
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">　</label>
          <input
            type="text"
            name="name"
            placeholder="お名前を登録してください"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">　</label>
          <select
            name="regionPrefecture"
            value={form.regionPrefecture}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            required
          >
            <option value="">　　　　都道府県を選択してください　　　　</option>
            {prefectureList.map((pref) => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">　</label>
          <select
            name="industry"
            value={form.industry}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            required
          >
            <option value="">　　　　業種を選択してください　　　　</option>
            {industryList.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-full disabled:opacity-40"
          >
            {submitting ? "はじめています..." : "はじめる"}
          </button>
        </div>

        {message && <p className="text-center text-sm text-green-600 mt-4">{message}</p>}
      </form>
    </div>
  );
}
