import { db } from "@/lib/firebase"; // ✅ Firebase の初期化済みインスタンスをインポート
import { doc, getDoc } from "firebase/firestore";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    let referredBy = url.searchParams.get("ref");
    if (!referredBy) throw new Error("紹介コードが指定されていません");

    let role = "client";  // デフォルト
    let referrerId = referredBy || null;

    // ✅ 固定コード対応（HQ-ADMIN 追加済み）
    if (referredBy === "HQ-ADMIN") role = "admin";
    else if (referredBy === "HQ-AGENCY") role = "agency";
    else if (referredBy === "HQ-USER") role = "user";
    else if (referredBy === "HQ-CLIENT") role = "client";
    else if (referredBy.startsWith("CQ-CLIENT-")) {
      // ✅ クライアントの紹介コード対応
      referredBy = referredBy.replace("CQ-CLIENT-", ""); // UIDを取得
      const refUser = await getDoc(doc(db, "users", referredBy));
      if (refUser.exists() && refUser.data().role === "client") {
        role = "client";
        referrerId = referredBy;
      } else {
        throw new Error("紹介コードが無効です");
      }
    } else {
      // 通常の紹介コード（UIDのまま登録されている場合）
      const refUser = await getDoc(doc(db, "users", referredBy));
      if (refUser.exists()) {
        const refData = refUser.data();
        if (refData.role === "admin") role = "agency";
        else if (refData.role === "agency") role = "user";
        else if (refData.role === "user") role = "client";
        referrerId = referredBy;
      } else {
        throw new Error("紹介コードが無効です");
      }
    }

    return new Response(JSON.stringify({ role, referrerId }), { status: 200 });

  } catch (error) {
    console.error("❌ [REFERRAL] 紹介コード解析エラー:", error.message);

    await fetch("/api/logs", {
      method: "POST",
      body: JSON.stringify({
        level: "error",
        message: `[REFERRAL] ${error.message}`,
        environment: process.env.NODE_ENV || "development",
      }),
      headers: { "Content-Type": "application/json" },
    });

    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
