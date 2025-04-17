"use client";

import { useState, useEffect } from "react";
import { firebaseAuth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
  "IT・ソフトウェア", "製造業", "建設業", "運輸・物流", "小売・卸売",
  "医療・福祉", "教育・学習支援", "飲食・宿泊業", "金融業", "サービス業", "その他"
];

export default function ClientUpdatePage() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [name, setName] = useState("");
  const [regionPrefecture, setRegionPrefecture] = useState("");
  const [regionCity, setRegionCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [email, setEmail] = useState("");
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const clientRef = doc(db, "clients", currentUser.uid);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) {
          const data = clientSnap.data();
          setCompany(data.company || "");
          setPosition(data.position || "");
          setName(data.name || "");
          setRegionPrefecture(data.regionPrefecture || "");
          setRegionCity(data.regionCity || "");
          setIndustry(data.industry || "");
          setEmail(data.email || "");
          setMemo(data.memo || "");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const registerClient = async () => {
    if (!user) return;
    try {
      const clientRef = doc(db, "clients", user.uid);
      await updateDoc(clientRef, {
        company,
        position,
        name,
        regionPrefecture,
        regionCity,
        industry,
        email,
        memo,
        updatedAt: new Date(),
      });
      setMessage("✅ 登録内容を更新しました！");
    } catch (error) {
      console.error("更新失敗:", error);
      setMessage("❌ 登録内容の更新に失敗しました");
    }
  };

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
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2" />
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
              {INDUSTRIES.map((ind) => (
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
