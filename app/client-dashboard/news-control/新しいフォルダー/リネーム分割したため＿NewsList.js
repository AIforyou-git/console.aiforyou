"use client";

import { useEffect, useState } from "react";
import scrapingClient from '@/lib/supabaseScrapingClient'; // ✅ 共通クライアントを使用
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast"; // ✅ toast を使う




const keywordOptions = ["補助金", "災害", "設備投資", "人材育成","お気に入り"];
const areaOptions = ["全国", "北海道", "東京", "大阪", "福岡"];
const sortOptions = [
  { label: "更新日（新しい順）", value: "structured_at" },
  { label: "タイトル（昇順）", value: "structured_title" },
];

export default function NewsControlPage() {
  const { toast } = useToast(); // ✅ ← ここに追加！
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const perPage = 20;
  const router = useRouter(); // ← この行を追加
  const [userId, setUserId] = useState(null);
  const [engaged, setEngaged] = useState({});
  const [showSearchOptions, setShowSearchOptions] = useState(false); // 🔽 初期値を非表示に変更
  const [showHiddenLink, setShowHiddenLink] = useState(false); // 👈 追加

useEffect(() => {
  const fetchEngagement = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data, error } = await supabase
      .from("user_engagement_logs")
      .select("article_id, action_type")
      .eq("user_id", user.id);

    if (error) {
      console.warn("評価データ取得失敗:", error.message);
      return;
    }

    const map = {};
    data.forEach(({ article_id, action_type }) => {
      if (!map[article_id]) map[article_id] = {};
      map[article_id][action_type] = true;
    });
    setEngaged(map);
  };

  fetchEngagement();
}, []);

  const handleEngagement = async (articleId, actionType) => {
  if (!userId) return;

  const { error } = await supabase
    .from("user_engagement_logs")
    .upsert([
      {
        user_id: userId,
        article_id: articleId,
        action_type: actionType,
        action_value: true,
      },
    ], { onConflict: "user_id,article_id,action_type" });

  if (error) {
    toast({
      title: "エラー",
      description: "保存に失敗しました",
      variant: "destructive",
    });
    console.error("評価保存エラー:", error.message);
  } else {
    toast({
      title: actionType === "like" ? "お気に入りに追加" : "非表示にしました",
      description: "保存が完了しました",
    });
  }
};


// ✅ 初期化でユーザーID取得
useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };
  getUser();
}, []);

// ✅ 評価保存処理



  const [keyword, setKeyword] = useState("");
  const [area, setArea] = useState("");
  const [sortBy, setSortBy] = useState("structured_at");
  const [ascending, setAscending] = useState(false);

  // ✅ クライアントの都道府県（region_prefecture）を取得して area にセット（初期化）
useEffect(() => {
  const fetchClientRegion = async () => {
    if (area) return; // ← UIで選択されていれば何もしない

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("clients")
      .select("region_prefecture")
      .eq("uid", user.id)
      .single();

    if (error) {
      console.warn("地域情報の取得エラー:", error.message);
      return;
    }

    // ✅ 自動で地域設定し、全国対応も含めた絞り込みを可能に
    if (data?.region_prefecture) {
  console.log("✅ クライアント地域取得:", data.region_prefecture);
  setArea(data.region_prefecture);
}
  };

  fetchClientRegion();
}, []); // 初回マウント時のみ実行

  useEffect(() => {
  const fetchArticles = async (clientArea, uid) => {
    setLoading(true);
    const from = page * perPage;
    const to = from + perPage - 1;

    let query = scrapingClient
      .from("jnet_articles_public")
      .select(`
        article_id,
        structured_title,
        structured_agency,
        structured_prefecture,
        structured_application_period,
        structured_summary_extract,
        structured_amount_max,
        detail_url
      `);

    //🧠 記事マッチング（取得地域と全国）
    if (clientArea) {
      query = query.in("structured_prefecture", [clientArea, "全国"]);
    }

    if (keyword === "お気に入り") {
  // ✅ お気に入り記事IDを取得して絞り込む
  const { data: likes, error: likesError } = await supabase
    .from("user_engagement_logs")
    .select("article_id")
    .eq("user_id", uid)
    .eq("action_type", "like")
    .eq("action_value", true);

  if (likesError) {
    console.warn("お気に入りの取得エラー:", likesError.message);
  } else {
    const likedIds = likes.map((l) => l.article_id);
    if (likedIds.length > 0) {
      query = query.in("article_id", likedIds);
    } else {
      // ヒットしないように強制的に0を返す
      query = query.in("article_id", [-1]);
    }
  }
} else if (keyword) {
  const safeKeyword = encodeURIComponent(keyword.trim());

  query = query.or(
    `structured_title.ilike.*${safeKeyword}*,structured_summary_extract.ilike.*${safeKeyword}*`
  );
}
    query = query.order(sortBy, { ascending });

    const { data, error } = await query.range(from, to);

    if (error) {
      console.error("記事の取得エラー:", error.message);
    } else {
      setArticles(data || []);
    }

    setLoading(false);
  };

  const fetchClientRegionAndArticles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("clients")
      .select("region_prefecture")
      .eq("uid", user.id)
      .single();

    if (error) {
      console.warn("地域情報の取得エラー:", error.message);
      return;
    }

    if (data?.region_prefecture && user?.id) {
  setArea(data.region_prefecture); // ✅ 状態にもセット
  await fetchArticles(data.region_prefecture, user.id); // ✅ uidを渡す
}
  };

  fetchClientRegionAndArticles();
}, [page, keyword, sortBy, ascending]); // ✅ area は外す


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
  📢 あなた向けの支援情報
  <span className="text-sm text-gray-500 ml-3">
    （{articles.length} 件）
  </span>
</h1>
      <div className="flex justify-end mb-2">
  <button
    onClick={() => setShowSearchOptions(!showSearchOptions)}
    className="text-sm text-gray-400 hover:text-gray-600 underline"
  >
    {showSearchOptions ? "🔽 検索オプションを隠す" : "▶ 検索オプションを表示"}
  </button>
</div>
{showSearchOptions && (
  <>
    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
      <input
        type="text"
        placeholder="キーワード検索（例：補助金, 雇用）"
        value={keyword}
        onChange={(e) => {
          setPage(0);
          setKeyword(e.target.value);
        }}
        className="border px-3 py-2 rounded w-full md:w-1/3"
      />

      <select
        value={area}
        onChange={(e) => {
          setPage(0);
          setArea(e.target.value);
        }}
        className="hidden"
      >
        <option value="">エリア選択</option>
        {areaOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => {
          setPage(0);
          setSortBy(e.target.value);
          setAscending(e.target.value !== "structured_at");
        }}
        className="border px-3 py-2 rounded w-full md:w-1/4"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>

    <div className="mb-4">
      <span className="mr-2 font-semibold text-sm">おすすめキーワード:</span>
      {keywordOptions.map((word) => (
        <button
          key={word}
          className="text-sm bg-blue-100 text-blue-800 px-2 py-1 mr-2 rounded"
          onClick={() => {
            setPage(0);
            setKeyword(word);
          }}
        >
          {word}
        </button>
      ))}
    </div>

    <div className="flex justify-end mb-4">
      <Link
        href="/client-dashboard/hidden"
        className="text-sm text-gray-500 underline hover:text-gray-700"
      >
        🚫 非表示にした記事一覧を見る
      </Link>
    </div>
  </>
)}




      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          <div className="space-y-4">
  {articles.map((article) => {
    // 🚫 不要にされた記事は表示しない
    if (engaged[article.article_id]?.ignore) return null;
    




    return (
      <div
        key={article.article_id}
        className="p-4 border rounded-lg shadow-sm bg-white"
        
      
      > 
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">
              {article.structured_title || "（タイトル未定）"}
              {engaged[article.article_id]?.like && (
                <span className="text-yellow-400 text-xl ml-2">★</span>
              )}
            </h2>
            <p className="text-sm text-gray-500">
              {article.structured_agency || "機関不明"} /{" "}
              {article.structured_prefecture || ""} /{" "}
              {article.structured_application_period?.start || "未定"}
            </p>
            {article.structured_summary_extract && (
              <p className="text-sm text-gray-700 mt-1">
                {article.structured_summary_extract}
              </p>
            )}
            {article.structured_amount_max && (
              <p className="text-sm text-gray-600 mt-1">
                💰 {article.structured_amount_max}
              </p>
            )}
            <a
              href={article.detail_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm mt-1 inline-block"
            >
              記事を見る
            </a>

            <div className="mt-2">
              <button
                onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) {
                    alert("ログインが必要です。");
                    return;
                  }
                  const uid = user.id;
                  const userEmail = user.email ?? null;
                  const articleId = article.article_id;
                  const articleTitle = article.structured_title ?? null;

                  const { data: session, error: fetchError } = await supabase
                    .from("chat_sessions")
                    .select("id")
                    .eq("user_id", uid)
                    .eq("article_id", articleId)
                    .single();

                  let sessionId = session?.id;

                  if (!sessionId) {
                    const { data: inserted, error: insertError } = await supabase
                      .from("chat_sessions")
                      .insert([{
                        user_id: uid,
                        article_id: articleId,
                        user_email: userEmail,
                        article_title_snippet: articleTitle ?? "（タイトル未定）",
                        status: "active",
                      }])
                      .select("id")
                      .single();

                    if (insertError || !inserted) {
                      alert("セッションの作成に失敗しました。");
                      return;
                    }

                    sessionId = inserted.id;
                  }

                  router.push(`/chat-module-sb?aid=${articleId}&uid=${uid}&sid=${sessionId}`);
                }}
                className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded flex items-center"
              >
                💬 申請サポート
              </button>

              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => handleEngagement(article.article_id, "like")}
                  className="text-sm px-3 py-1 border border-emerald-400 text-emerald-600 rounded hover:bg-emerald-50"
                >
                  👍 お気に入り
                </button>

                <button
  onClick={async () => {
    await handleEngagement(article.article_id, "ignore");
    setEngaged((prev) => ({
      ...prev,
      [article.article_id]: {
        ...prev[article.article_id],
        ignore: true,
      },
    }));
  }}
  className="text-sm px-3 py-1 border border-red-400 text-red-600 rounded hover:bg-red-50"
>
  🚫 この情報は不要
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>

          

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              disabled={page === 0}
            >
              ← 前へ
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              次へ →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
