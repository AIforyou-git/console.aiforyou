"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
//import scrapingSupabase from "@/lib/supabaseScrapingClient";

import scrapingSupabaseOnlyForThisPage from "@/lib/supabaseScrapingClient";

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

//const INDUSTRIES = [
//  "農業，林業", "漁業", "鉱業，採石業，砂利採取業", "建設業", "製造業",
//  "電気・ガス・熱供給・水道業", "情報通信業", "運輸業，郵便業", "卸売業，小売業",
//  "金融業，保険業", "不動産業，物品賃貸業", "学術研究，専門・技術サービス業",
//  "宿泊業，飲食サービス業", "生活関連サービス業，娯楽業", "教育，学習支援業",
//  "医療，福祉", "複合サービス事業", "サービス業（他に分類されないもの）",
//  "公務（他に分類されるものを除く）", "分類不能の産業"
//];

export default function ClientUpdatePage() {
  const { user, loading } = useAuth();
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [name, setName] = useState("");
  const [regionPrefecture, setRegionPrefecture] = useState("");
  const [regionCity, setRegionCity] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [industry, setIndustry] = useState("");
  useEffect(() => {
  const fetchCategoryData = async () => {
    
  const { data, error } = await scrapingSupabaseOnlyForThisPage
  .from("industry_category_mapping_api")
  .select("refined_personal_category, subcategory");
    if (error) {
      console.error("カテゴリ取得失敗:", error);
      return;
    }

    const categorySet = new Set();
    const subcatMap = {};

    data.forEach(({ refined_personal_category, subcategory }) => {
      if (refined_personal_category) {
        categorySet.add(refined_personal_category);
        if (!subcatMap[refined_personal_category]) {
          subcatMap[refined_personal_category] = [];
        }
        if (subcategory) {
          subcatMap[refined_personal_category].push(subcategory);
        }
      }
    });

    setRefinedPersonalCategoryOptions(Array.from(categorySet));
    setSubcategoryOptions(subcatMap);
  };

  fetchCategoryData();
}, []);
   const [refinedPersonalCategory, setRefinedPersonalCategory] = useState("");
const [refinedPersonalCategoryOptions, setRefinedPersonalCategoryOptions] = useState([]);
const [subcategoryOptions, setSubcategoryOptions] = useState({});
const [subcategory, setSubcategory] = useState(""); // ✅ 追加
const [memo, setMemo] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [matchByCity, setMatchByCity] = useState(true); // ✅

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
          setRefinedPersonalCategory((clientData.industry ?? "").trim()); // ✅ 追加
  setSubcategory(clientData.industry_2 ?? ""); // ✅ 任意設定も復元
          setMemo(clientData.memo ?? "");
          setMatchByCity(clientData.match_by_city ?? true); // ✅
        }

        setEmail(userData.email ?? "");
      } catch (error) {
        console.error("全体取得エラー:", (error instanceof Error ? error.message : error));
        setMessage("❌ 情報の取得に失敗しました");
      }
    };

    if (!loading) fetchAll();
  }, [user, loading]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!regionPrefecture) return;

      const { data, error } = await supabase
        .from("city_master")
        .select("city_kanji")
        .eq("prefecture_kanji", regionPrefecture)
        .order("city_kanji", { ascending: true });

      if (error) {
        console.error("市区町村取得エラー:", error.message);
        setCityOptions([]);
        return;
      }

      //const cities = data.map(row => row.city_kanji).filter(Boolean);
      //setCityOptions(cities);
      const cities = [...new Set(data.map(row => row.city_kanji).filter(Boolean))]; // ✅ 重複除去
setCityOptions(cities);
    };

    fetchCities();
  }, [regionPrefecture]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const registerClient = async () => {
  if (!user?.id) return;
  if (matchByCity && !regionCity) {
    alert("市区町村の選択が必要です");
    return;
  }

  try {
    const now = new Date().toISOString();

    // ✅ region_full を構成（matchByCity = false の場合は null を保存）
let regionFull = null;

if (matchByCity) {
  if (regionPrefecture.includes("、") || regionPrefecture.includes(",") || regionPrefecture.includes("，")) {
    regionFull = "全国"; // 都道府県が複数の場合は全国扱い
  } else if (regionCity && regionCity.trim() !== "") {
    regionFull = regionPrefecture + regionCity;
  }
}

    const { error } = await supabase
  .from("clients")
  .upsert({
    uid: user.id,
    company,
    position,
    name,
    region_prefecture: regionPrefecture,
    
    region_city: regionCity,
    region_full: regionFull, // ✅ 追加保存
    industry: refinedPersonalCategory,     // ✅ 上書き保存
    industry_2: subcategory || null,       // ✅ 新カラムに保存（任意）
    memo,
    match_by_city: matchByCity,
    profile_completed: true,
    updated_at: now,
  }, {
    onConflict: "uid",
});
        if (error) throw error;

    // 🟢 client_daily_matches に保存
   const today = new Date().toISOString().slice(0, 10);
   const todayISO = new Date().toISOString().slice(0, 10); // 例: "2025-05-19"

// regionFull は既に定義済なので再定義せず使用する
    if (regionPrefecture.includes("、") || regionPrefecture.includes(",") || regionPrefecture.includes("，")) {
      regionFull = "全国";
    } else if (regionCity && regionCity.trim() !== "") {
      regionFull = regionPrefecture + regionCity;
    }

    
  const regionCondition = matchByCity
  ? `structured_area_full.eq.${regionFull},and(structured_prefecture.eq.${regionPrefecture},structured_city.is.null),structured_prefecture.eq.全国`
  : `structured_prefecture.in.(${regionPrefecture},全国)`;

// ✅ JSTの本日0:00〜23:59を定義
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const todayEnd = new Date();
todayEnd.setHours(23, 59, 59, 999);

//const { data: articles, error: articleError } = await scrapingSupabase
const { data: articles, error: articleError } = await scrapingSupabaseOnlyForThisPage
  .from("jnet_articles_public")
  .select("article_id, structured_prefecture, structured_area_full, structured_city, published_at")
  .eq("visible", true)
  .gte("published_at", todayStart.toISOString())
  .lte("published_at", todayEnd.toISOString())
  .or(regionCondition);

console.log("✅ 記事取得エラー:", articleError);
console.log("✅ 記事取得数:", articles?.length);
console.log("✅ matchByCity:", matchByCity);
console.log("✅ regionPrefecture:", regionPrefecture);
console.log("✅ regionFull:", regionFull);

if (articleError) {
  console.error("❌ マッチ記事取得エラー:", articleError.message);
}

const matchedIds = (articles || []).map(a => a.article_id);
console.log("✅ マッチ記事数:", matchedIds.length);
console.log("✅ matched_articles:", matchedIds);

const { error: upsertError } = await supabase
  .from("client_daily_matches")
  .upsert([
    {
      user_id: user.id,
      target_date: today,
      matched_articles: matchedIds,
      calculated_at: new Date(),
      source: "client"
    }
  ], { onConflict: ['user_id', 'target_date'] });

if (upsertError) {
  console.error("マッチ保存失敗:", upsertError.message);
}


    setMessage("✅ 登録内容を更新しました！");

  } catch (error) {
    console.error("更新失敗:", (error instanceof Error ? error.message : error));
    setMessage("❌ 登録内容の更新に失敗しました");
  }
};


  // 業種選択を一時的に非表示にしたため、INDUSTRIES 依存も無効化
const effectiveIndustries = [];

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">アカウント登録内容</h2>
        <form className="space-y-4">
          <Input label="会社名" value={company} onChange={setCompany} />
          <Input label="役職" value={position} onChange={setPosition} />
          <Input label="お名前" value={name} onChange={setName} required />
          <Input label="メールアドレス" value={email} disabled />

          <Select
  label="都道府県"
  value={regionPrefecture}
  onChange={(val) => {
    setRegionPrefecture(val);
    setRegionCity("");
  }}
  options={PREFECTURES}
  required
  disabled={matchByCity}
/>


          <Select
            label="市区町村"
            value={regionCity}
            onChange={setRegionCity}
            options={cityOptions}
            required={matchByCity}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="match_by_city"
              checked={matchByCity}
              onChange={(e) => setMatchByCity(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="match_by_city" className="text-sm text-gray-700">
              市区町村まで絞り込む（ON：厳密配信／OFF：都道府県単位）
            </label>
          </div>

          <Select
            label="あなたの気になっている事は何ですか？"
            value={refinedPersonalCategory}
            onChange={(val) => {
              setRefinedPersonalCategory(val);
              setSubcategory(""); // リセット
            }}
            options={refinedPersonalCategoryOptions}
          />

          
{refinedPersonalCategory && (
  <Select
    label="最も近い業種はなんですか？（任意）"
    value={subcategory}
    onChange={setSubcategory}
    options={subcategoryOptions[refinedPersonalCategory] || []}
  />
)}

          
          

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

function Select({ label, value, onChange, options, required = false, disabled = false }) {
  const handleMouseDown = (e) => {
    if (label === "都道府県" && !window._hasWarnedPrefectureChange) {
      alert("⚠️ 都道府県を変更すると、1ヶ月間は再変更できません。慎重に選択してください。");
      window._hasWarnedPrefectureChange = true;
    }
  };

  return (
    <div>
      <label className="block mb-1 text-sm font-medium">{label}:</label>
      <select
  value={value}
  onChange={(e) => onChange?.(e.target.value)}
  onMouseDown={handleMouseDown}
  required={required}
  disabled={disabled}
  className="w-full border border-gray-300 rounded px-3 py-2"
>
  <option value="" disabled>選択してください</option> {/* ✅ 修正: 選択不可に */}
  {options.map((opt) => (
    <option key={opt} value={opt}>{opt}</option>
  ))}
</select>
    </div>
  );
}

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
